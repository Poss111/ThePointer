package com.pointer.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubmitVoteRequest {
    @NotBlank(message = "Participant name is required")
    private String participantName;

    @NotNull(message = "Points are required")
    @Min(value = 0, message = "Points must be non-negative")
    private Integer points;

    public SubmitVoteRequest() {
    }

    public SubmitVoteRequest(String participantName, Integer points) {
        this.participantName = participantName;
        this.points = points;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }
}

