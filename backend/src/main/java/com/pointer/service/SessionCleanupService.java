package com.pointer.service;

import com.pointer.repository.SessionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SessionCleanupService {

    private final SessionRepository sessionRepository;

    public SessionCleanupService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    /**
     * Clear all sessions created before today (runs nightly at midnight).
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void purgeOldSessions() {
        LocalDateTime cutoff = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        sessionRepository.deleteByCreatedAtBefore(cutoff);
    }
}


