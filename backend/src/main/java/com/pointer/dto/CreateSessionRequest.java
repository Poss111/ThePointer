package com.pointer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateSessionRequest {
    @NotBlank(message = "Story name is required")
    @Size(max = 255, message = "Story name must be less than 255 characters")
    private String storyName;

    @NotBlank(message = "Creator name is required")
    @Size(max = 100, message = "Creator name must be less than 100 characters")
    private String creatorName;

    public CreateSessionRequest() {
    }

    public CreateSessionRequest(String storyName, String creatorName) {
        this.storyName = storyName;
        this.creatorName = creatorName;
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
}

