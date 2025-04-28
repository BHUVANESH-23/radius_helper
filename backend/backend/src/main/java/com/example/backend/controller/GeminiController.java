package com.example.backend.controller;

import com.example.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestBody Map<String, Object> request) {
        double latitude = Double.parseDouble(request.get("latitude").toString());
        double longitude = Double.parseDouble(request.get("longitude").toString());
        int radius = Integer.parseInt(request.get("radius").toString());
        String prompt = request.get("prompt").toString();

        String fullPrompt = "Latitude: " + latitude + ", Longitude: " + longitude + ", Radius: " + radius + " meters. Question: " + prompt;

        // Log the fullPrompt to make sure the request is correct
        System.out.println("Request Full Prompt: " + fullPrompt);

        String response = geminiService.generateContent(fullPrompt);

        // Log the response from the service
        System.out.println("Generated Response: " + response);

        return ResponseEntity.ok(response);
    }
}
