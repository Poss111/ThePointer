package com.pointer.controller;

import com.pointer.dto.JiraIssueRequest;
import com.pointer.dto.JiraIssueResponse;
import com.pointer.service.JiraIntegrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/integrations")
@CrossOrigin(origins = "http://localhost:4200")
public class IntegrationController {

    @Autowired
    private JiraIntegrationService jiraIntegrationService;

    @PostMapping("/jira/issue")
    public ResponseEntity<JiraIssueResponse> getIssue(@Valid @RequestBody JiraIssueRequest request) {
        try {
            JiraIssueResponse response = jiraIntegrationService.fetchIssue(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}


