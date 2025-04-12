package com.positionbook.controller;

import com.positionbook.model.Position;
import com.positionbook.model.TradeEvent;
import com.positionbook.service.PositionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PositionController {

    private final PositionService positionService;

    @Autowired
    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @PostMapping("/events")
    public ResponseEntity<Void> processEvents(@RequestBody @Valid List<TradeEvent> events) {
        positionService.processEvents(events);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/positions")
    public ResponseEntity<List<Position>> getPositions() {
        return ResponseEntity.ok(positionService.getAllPositions());
    }
} 