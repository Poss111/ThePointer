package com.pointer.controller;

import com.pointer.dto.*;
import com.pointer.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:4200")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(@Valid @RequestBody CreateSessionRequest request) {
        try {
            SessionResponse response = sessionService.createSession(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{sessionId}/join")
    public ResponseEntity<SessionResponse> joinSession(
            @PathVariable String sessionId,
            @Valid @RequestBody JoinSessionRequest request) {
        try {
            SessionResponse response = sessionService.joinSession(sessionId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{sessionId}/start")
    public ResponseEntity<SessionResponse> startVoting(
            @PathVariable String sessionId,
            @RequestParam String creatorName) {
        try {
            SessionResponse response = sessionService.startVoting(sessionId, creatorName);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{sessionId}/vote")
    public ResponseEntity<VoteResponse> submitVote(
            @PathVariable String sessionId,
            @Valid @RequestBody SubmitVoteRequest request) {
        try {
            VoteResponse response = sessionService.submitVote(sessionId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{sessionId}/story")
    public ResponseEntity<SessionResponse> startNewStory(
            @PathVariable String sessionId,
            @Valid @RequestBody NewStoryRequest request) {
        try {
            SessionResponse response = sessionService.startNewStory(sessionId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{sessionId}/leave")
    public ResponseEntity<Void> leaveSession(
            @PathVariable String sessionId,
            @Valid @RequestBody LeaveSessionRequest request) {
        try {
            sessionService.leaveSession(sessionId, request);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(
            @PathVariable String sessionId,
            @RequestParam String participantName) {
        try {
            SessionResponse response = sessionService.getSession(sessionId, participantName);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{sessionId}/votes")
    public ResponseEntity<List<VoteResponse>> getVotes(
            @PathVariable String sessionId,
            @RequestParam String participantName) {
        try {
            List<VoteResponse> votes = sessionService.getVotes(sessionId, participantName);
            return ResponseEntity.ok(votes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<SessionSummaryResponse>> getSessionHistory() {
        try {
            List<SessionSummaryResponse> sessions = sessionService.getSessionHistory();
            return ResponseEntity.ok(sessions);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}

