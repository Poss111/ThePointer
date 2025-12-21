package com.pointer.dto;

import java.time.LocalDateTime;

public class SessionSummaryResponse {
    private String sessionId;
    private String storyName;
    private String creatorName;
    private LocalDateTime createdAt;
    private boolean votingStarted;

    public SessionSummaryResponse() {
    }

    public SessionSummaryResponse(String sessionId, String storyName, String creatorName, LocalDateTime createdAt, boolean votingStarted) {
        this.sessionId = sessionId;
        this.storyName = storyName;
        this.creatorName = creatorName;
        this.createdAt = createdAt;
        this.votingStarted = votingStarted;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getStoryName() {
        return storyName;
    }

    public void setStoryName(String storyName) {
        this.storyName = storyName;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isVotingStarted() {
        return votingStarted;
    }

    public void setVotingStarted(boolean votingStarted) {
        this.votingStarted = votingStarted;
    }
}


