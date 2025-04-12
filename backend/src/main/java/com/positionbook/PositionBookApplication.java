package com.positionbook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "http://localhost:3000") // For React frontend
public class PositionBookApplication {
    public static void main(String[] args) {
        SpringApplication.run(PositionBookApplication.class, args);
    }
} 