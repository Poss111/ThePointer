package com.pointer.dto;

public class VoteResponse {
    private String participantName;
    private Integer points;
    private boolean isOwnVote;

    public VoteResponse() {
    }

    public VoteResponse(String participantName, Integer points, boolean isOwnVote) {
        this.participantName = participantName;
        this.points = points;
        this.isOwnVote = isOwnVote;
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

    public boolean isOwnVote() {
        return isOwnVote;
    }

    public void setOwnVote(boolean ownVote) {
        isOwnVote = ownVote;
    }
}

