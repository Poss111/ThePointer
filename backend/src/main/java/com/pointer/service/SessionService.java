package com.pointer.service;

import com.pointer.dto.*;
import com.pointer.model.Participant;
import com.pointer.model.Session;
import com.pointer.model.Vote;
import com.pointer.repository.ParticipantRepository;
import com.pointer.repository.SessionRepository;
import com.pointer.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private VoteRepository voteRepository;

    private static final int MAX_PARTICIPANTS = 15;
    private static final int DEFAULT_TIMER_DURATION = 60; // 60 seconds default

    @Transactional
    public SessionResponse createSession(CreateSessionRequest request) {
        String sessionId = UUID.randomUUID().toString().substring(0, 8);
        
        Session session = new Session(sessionId, request.getStoryName(), request.getCreatorName());
        session = sessionRepository.save(session);

        // Add creator as first participant
        Participant creator = new Participant(request.getCreatorName(), session);
        participantRepository.save(creator);

        return mapToSessionResponse(session, request.getCreatorName());
    }

    @Transactional
    public SessionResponse joinSession(String sessionId, JoinSessionRequest request) {
        Session session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.isVotingStarted()) {
            throw new RuntimeException("Voting has already started. Cannot join.");
        }

        List<Participant> participants = participantRepository.findBySessionId(session.getId());
        if (participants.size() >= MAX_PARTICIPANTS) {
            throw new RuntimeException("Session is full. Maximum " + MAX_PARTICIPANTS + " participants allowed.");
        }

        // Check if participant name already exists
        boolean nameExists = participants.stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(request.getParticipantName()));
        if (nameExists) {
            throw new RuntimeException("Participant name already exists in this session.");
        }

        Participant participant = new Participant(request.getParticipantName(), session);
        participantRepository.save(participant);

        return mapToSessionResponse(session, request.getParticipantName());
    }

    @Transactional
    public SessionResponse startVoting(String sessionId, String creatorName) {
        Session session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getCreatorName().equals(creatorName)) {
            throw new RuntimeException("Only the creator can start voting.");
        }

        if (session.isVotingStarted()) {
            throw new RuntimeException("Voting has already started.");
        }

        session.setVotingStarted(true);
        session.setVotingStartTime(LocalDateTime.now());
        session.setTimerDurationSeconds(DEFAULT_TIMER_DURATION);
        session = sessionRepository.save(session);

        return mapToSessionResponse(session, creatorName);
    }

    @Transactional
    public VoteResponse submitVote(String sessionId, SubmitVoteRequest request) {
        Session session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.isVotingStarted()) {
            throw new RuntimeException("Voting has not started yet.");
        }

        // Check if timer has expired
        if (isTimerExpired(session)) {
            throw new RuntimeException("Voting time has expired.");
        }

        // Check if participant exists
        List<Participant> participants = participantRepository.findBySessionId(session.getId());
        boolean participantExists = participants.stream()
                .anyMatch(p -> p.getName().equals(request.getParticipantName()));
        if (!participantExists) {
            throw new RuntimeException("Participant not found in this session.");
        }

        // Update or create vote
        Vote existingVote = voteRepository.findBySessionIdAndParticipantName(
                session.getId(), request.getParticipantName()).orElse(null);

        if (existingVote != null) {
            existingVote.setPoints(request.getPoints());
            existingVote.setVotedAt(LocalDateTime.now());
            voteRepository.save(existingVote);
        } else {
            Vote vote = new Vote(session, request.getParticipantName(), request.getPoints());
            voteRepository.save(vote);
        }

        return new VoteResponse(request.getParticipantName(), request.getPoints(), true);
    }

    public SessionResponse getSession(String sessionId, String participantName) {
        Session session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return mapToSessionResponse(session, participantName);
    }

    public List<VoteResponse> getVotes(String sessionId, String participantName) {
        Session session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Vote> votes = voteRepository.findBySessionId(session.getId());
        
        return votes.stream()
                .map(vote -> new VoteResponse(
                        vote.getParticipantName(),
                        vote.getPoints(),
                        vote.getParticipantName().equals(participantName)
                ))
                .collect(Collectors.toList());
    }

    public List<SessionSummaryResponse> getSessionHistory() {
        return sessionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(session -> new SessionSummaryResponse(
                        session.getSessionId(),
                        session.getStoryName(),
                        session.getCreatorName(),
                        session.getCreatedAt(),
                        session.isVotingStarted()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public SessionResponse startNewStory(String sessionId, NewStoryRequest request) {
        Session session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getCreatorName().equals(request.getCreatorName())) {
            throw new RuntimeException("Only the creator can start a new story.");
        }

        // Reset voting state and update story
        session.setStoryName(request.getStoryName());
        session.setVotingStarted(false);
        session.setVotingStartTime(null);
        session.setTimerDurationSeconds(null);

        voteRepository.deleteBySessionId(session.getId());
        sessionRepository.save(session);

        return mapToSessionResponse(session, request.getCreatorName());
    }

    @Transactional
    public void leaveSession(String sessionId, LeaveSessionRequest request) {
        Session session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Participant> participants = participantRepository.findBySessionId(session.getId());
        boolean participantExists = participants.stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(request.getParticipantName()));

        if (!participantExists) {
            throw new RuntimeException("Participant not found in this session.");
        }

        boolean isCreator = session.getCreatorName().equalsIgnoreCase(request.getParticipantName());

        if (isCreator) {
            // Creator leaves: clear votes, participants, and delete session to force everyone out
            voteRepository.deleteBySessionId(session.getId());
            participantRepository.deleteBySessionId(session.getId());
            sessionRepository.delete(session);
            return;
        }

        // Non-creator leaves: remove their votes and participation
        voteRepository.deleteBySessionIdAndParticipantName(session.getId(), request.getParticipantName());
        participantRepository.deleteBySessionIdAndName(session.getId(), request.getParticipantName());
    }

    private SessionResponse mapToSessionResponse(Session session, String currentParticipantName) {
        SessionResponse response = new SessionResponse();
        response.setSessionId(session.getSessionId());
        response.setStoryName(session.getStoryName());
        response.setCreatorName(session.getCreatorName());
        response.setVotingStarted(session.isVotingStarted());
        response.setVotingStartTime(session.getVotingStartTime());
        response.setTimerDurationSeconds(session.getTimerDurationSeconds());
        response.setCreator(session.getCreatorName().equals(currentParticipantName));

        List<String> participantNames = participantRepository.findBySessionId(session.getId())
                .stream()
                .map(Participant::getName)
                .collect(Collectors.toList());
        response.setParticipants(participantNames);

        if (session.isVotingStarted() && session.getVotingStartTime() != null) {
            long remainingSeconds = calculateRemainingSeconds(session);
            response.setRemainingSeconds(remainingSeconds > 0 ? remainingSeconds : 0);
        }

        return response;
    }

    private boolean isTimerExpired(Session session) {
        if (!session.isVotingStarted() || session.getVotingStartTime() == null) {
            return false;
        }
        long elapsedSeconds = ChronoUnit.SECONDS.between(session.getVotingStartTime(), LocalDateTime.now());
        return elapsedSeconds >= session.getTimerDurationSeconds();
    }

    private long calculateRemainingSeconds(Session session) {
        if (!session.isVotingStarted() || session.getVotingStartTime() == null) {
            return 0;
        }
        long elapsedSeconds = ChronoUnit.SECONDS.between(session.getVotingStartTime(), LocalDateTime.now());
        long remaining = session.getTimerDurationSeconds() - elapsedSeconds;
        return Math.max(0, remaining);
    }
}

