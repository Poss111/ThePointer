package com.pointer.repository;

import com.pointer.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findBySessionId(Long sessionId);
    void deleteBySessionId(Long sessionId);
    void deleteBySessionIdAndName(Long sessionId, String name);
}

