package com.pointer.dto;

public class JiraIssueResponse {
    private String key;
    private String summary;
    private String status;
    private String description;

    public JiraIssueResponse() {
    }

    public JiraIssueResponse(String key, String summary, String status, String description) {
        this.key = key;
        this.summary = summary;
        this.status = status;
        this.description = description;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}


