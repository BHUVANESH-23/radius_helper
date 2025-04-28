package com.example.backend.service;

import com.example.backend.config.Properties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiService {

    private final RestTemplate restTemplate;
    private final Properties props;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService(RestTemplate restTemplate, Properties props) {
        this.restTemplate = restTemplate;
        this.props = props;
    }

    public String generateContent(String fullPrompt) {
        try {
            // Build the request JSON
            String body = """
        {
          "contents": [{
            "parts": [{"text": "%s"}]
          }]
        }
        """.formatted(fullPrompt.replace("\"", "\\\""));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            // Call Gemini API
            ResponseEntity<String> resp = restTemplate.exchange(
                    props.getUrl() + "?key=" + props.getApiKey(),
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            // Log the full response for debugging
            String rawResponse = resp.getBody();
            System.out.println("🌐 Full Gemini response: " + rawResponse);

            // Parse the JSON and extract the answer
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");

                if (parts.isArray() && !parts.isEmpty()) {
                    String answer = parts.get(0).path("text").asText();
                    return answer;
                } else {
                    return "No parts found in the response.";
                }
            } else {
                return "No candidates returned by Gemini.";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "Error while communicating with Gemini: " + e.getMessage();
        }
    }



}




