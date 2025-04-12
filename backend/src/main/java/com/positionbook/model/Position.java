package com.positionbook.model;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class Position {
    private String account;
    private String security;
    private Long totalQuantity;
    private List<TradeEvent> activeEvents = new ArrayList<>();
} 