package com.pointer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public class SessionResponse {
    private String sessionId;
    private String storyName;
    private String creatorName;
    private boolean votingStarted;
    private LocalDateTime votingStartTime;
    private Integer timerDurationSeconds;
    private List<String> participants;
    private Long remainingSeconds;

    @JsonProperty("isCreator")
    private boolean isCreator;

    public SessionResponse() {
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

    public boolean isVotingStarted() {
        return votingStarted;
    }

    public void setVotingStarted(boolean votingStarted) {
        this.votingStarted = votingStarted;
    }

    public LocalDateTime getVotingStartTime() {
        return votingStartTime;
    }

    public void setVotingStartTime(LocalDateTime votingStartTime) {
        this.votingStartTime = votingStartTime;
    }

    public Integer getTimerDurationSeconds() {
        return timerDurationSeconds;
    }

    public void setTimerDurationSeconds(Integer timerDurationSeconds) {
        this.timerDurationSeconds = timerDurationSeconds;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public Long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(Long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }

    public boolean isCreator() {
        return isCreator;
    }

    public void setCreator(boolean creator) {
        isCreator = creator;
    }
}

