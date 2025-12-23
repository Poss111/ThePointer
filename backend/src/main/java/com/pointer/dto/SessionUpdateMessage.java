package com.pointer.dto;

import java.util.List;

public class SessionUpdateMessage {
    private String type; // SESSION_UPDATE or SESSION_CLOSED
    private SessionResponse session;
    private List<VoteResponse> votes;

    public SessionUpdateMessage() {
    }

    public SessionUpdateMessage(String type, SessionResponse session, List<VoteResponse> votes) {
        this.type = type;
        this.session = session;
        this.votes = votes;
    }

    public static SessionUpdateMessage closed() {
        return new SessionUpdateMessage("SESSION_CLOSED", null, null);
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public SessionResponse getSession() {
        return session;
    }

    public void setSession(SessionResponse session) {
        this.session = session;
    }

    public List<VoteResponse> getVotes() {
        return votes;
    }

    public void setVotes(List<VoteResponse> votes) {
        this.votes = votes;
    }
}


