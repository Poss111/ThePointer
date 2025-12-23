package com.pointer.dto;

import jakarta.validation.constraints.NotBlank;

public class JiraIssueRequest {
    @NotBlank
    private String issueKey;

    public String getIssueKey() {
        return issueKey;
    }

    public void setIssueKey(String issueKey) {
        this.issueKey = issueKey;
    }
}


