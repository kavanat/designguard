package com.positionbook.service;

import com.positionbook.model.Position;
import com.positionbook.model.TradeEvent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PositionService {
    private final Map<String, TradeEvent> events = new ConcurrentHashMap<>();
    private final Map<String, Position> positions = new ConcurrentHashMap<>();

    public void processEvents(List<TradeEvent> newEvents) {
        for (TradeEvent event : newEvents) {
            processEvent(event);
        }
    }

    public void processEvent(TradeEvent event) {
        if (event.getAction() == TradeEvent.TradeAction.CANCEL) {
            cancelEvent(event.getId());
        } else {
            events.put(event.getId(), event);
            updatePosition(event);
        }
    }

    private void cancelEvent(String eventId) {
        TradeEvent existingEvent = events.get(eventId);
        if (existingEvent != null && existingEvent.isActive()) {
            existingEvent.setActive(false);
            updatePositionAfterCancel(existingEvent);
        }
    }

    private void updatePosition(TradeEvent event) {
        String key = getPositionKey(event.getAccount(), event.getSecurity());
        Position position = positions.computeIfAbsent(key, k -> Position.builder()
                .account(event.getAccount())
                .security(event.getSecurity())
                .totalQuantity(0L)
                .build());

        long quantityChange = event.getAction() == TradeEvent.TradeAction.BUY ? 
            event.getQuantity() : -event.getQuantity();
        
        position.setTotalQuantity(position.getTotalQuantity() + quantityChange);
        position.getActiveEvents().add(event);
    }

    private void updatePositionAfterCancel(TradeEvent event) {
        String key = getPositionKey(event.getAccount(), event.getSecurity());
        Position position = positions.get(key);
        if (position != null) {
            long quantityChange = event.getAction() == TradeEvent.TradeAction.BUY ? 
                -event.getQuantity() : event.getQuantity();
            
            position.setTotalQuantity(position.getTotalQuantity() + quantityChange);
            position.getActiveEvents().removeIf(e -> e.getId().equals(event.getId()));
            
            if (position.getActiveEvents().isEmpty()) {
                positions.remove(key);
            }
        }
    }

    public List<Position> getAllPositions() {
        return new ArrayList<>(positions.values());
    }

    private String getPositionKey(String account, String security) {
        return account + ":" + security;
    }
} 