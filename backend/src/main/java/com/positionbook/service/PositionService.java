package com.positionbook.service;

import com.positionbook.model.Position;
import com.positionbook.model.TradeEvent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
            validateEvent(event);
            events.put(event.getId(), event);
            updatePosition(event);
        }
    }

    private void validateEvent(TradeEvent event) {
        if (event.getAction() == TradeEvent.TradeAction.SELL) {
            String key = getPositionKey(event.getAccount(), event.getSecurity());
            Position position = positions.get(key);
            
            if (position == null) {
                throw new IllegalStateException(
                    String.format("Cannot SELL security %s: no position found for account %s", 
                        event.getSecurity(), event.getAccount())
                );
            }

            long availableQuantity = position.getTotalQuantity();
            if (availableQuantity < event.getQuantity()) {
                throw new IllegalStateException(
                    String.format("Cannot SELL %d units of %s: only %d units available in account %s", 
                        event.getQuantity(), event.getSecurity(), availableQuantity, event.getAccount())
                );
            }
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
        Position position = positions.computeIfAbsent(key, k -> {
            Position newPosition = new Position();
            newPosition.setAccount(event.getAccount());
            newPosition.setSecurity(event.getSecurity());
            newPosition.setTotalQuantity(0L);
            newPosition.setActiveEvents(new ArrayList<>());
            return newPosition;
        });

        long quantityChange = event.getAction() == TradeEvent.TradeAction.BUY ? 
            event.getQuantity() : -event.getQuantity();
        
        position.setTotalQuantity(position.getTotalQuantity() + quantityChange);
        position.getActiveEvents().add(event);

        // Remove position if quantity becomes zero
        if (position.getTotalQuantity() == 0) {
            positions.remove(key);
        }
    }

    private void updatePositionAfterCancel(TradeEvent event) {
        String key = getPositionKey(event.getAccount(), event.getSecurity());
        Position position = positions.get(key);
        if (position != null) {
            long quantityChange = event.getAction() == TradeEvent.TradeAction.BUY ? 
                -event.getQuantity() : event.getQuantity();
            
            position.setTotalQuantity(position.getTotalQuantity() + quantityChange);
            position.getActiveEvents().removeIf(e -> e.getId().equals(event.getId()));
            
            if (position.getActiveEvents().isEmpty() || position.getTotalQuantity() == 0) {
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