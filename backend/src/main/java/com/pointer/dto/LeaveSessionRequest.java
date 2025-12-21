package com.pointer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LeaveSessionRequest {

    @NotBlank(message = "Participant name is required")
    @Size(max = 100, message = "Participant name must be less than 100 characters")
    private String participantName;

    public LeaveSessionRequest() {
    }

    public LeaveSessionRequest(String participantName) {
        this.participantName = participantName;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }
}


