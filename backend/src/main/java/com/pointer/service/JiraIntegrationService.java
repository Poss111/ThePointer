package com.pointer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pointer.dto.JiraIssueRequest;
import com.pointer.dto.JiraIssueResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class JiraIntegrationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jira.base-url}")
    private String jiraBaseUrl;

    @Value("${jira.email}")
    private String jiraEmail;

    @Value("${jira.api-token}")
    private String jiraApiToken;

    public JiraIssueResponse fetchIssue(JiraIssueRequest request) {
        try {
            String url = String.format("%s/rest/api/3/issue/%s", jiraBaseUrl, request.getIssueKey());
            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Basic " + encodeCredentials(jiraEmail, jiraApiToken));
            headers.add("Accept", "application/json");

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            String key = root.path("key").asText();
            String summary = root.path("fields").path("summary").asText();
            String status = root.path("fields").path("status").path("name").asText();
            String description = extractDescription(root.path("fields").path("description"));

            return new JiraIssueResponse(key, summary, status, description);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to fetch JIRA issue: " + ex.getMessage(), ex);
        }
    }

    private String encodeCredentials(String email, String token) {
        String credentials = email + ":" + token;
        return Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private String extractDescription(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "";
        }
        // Atlassian document format: recursively flatten "content" arrays, collecting "text" nodes
        StringBuilder sb = new StringBuilder();
        flatten(node, sb);
        return sb.toString().trim();
    }

    private void flatten(JsonNode node, StringBuilder sb) {
        if (node == null) return;
        if (node.has("text")) {
            sb.append(node.get("text").asText());
        }
        if (node.has("content") && node.get("content").isArray()) {
            for (JsonNode child : node.get("content")) {
                flatten(child, sb);
                if ("paragraph".equals(child.path("type").asText())) {
                    sb.append("\n");
                }
            }
        }
    }
}


