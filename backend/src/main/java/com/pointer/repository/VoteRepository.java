package com.pointer.repository;

import com.pointer.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findBySessionId(Long sessionId);
    Optional<Vote> findBySessionIdAndParticipantName(Long sessionId, String participantName);
}

