package com.positionbook.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Position {
    private String account;
    private String security;
    private Long totalQuantity;
    
    @Builder.Default
    private List<TradeEvent> activeEvents = new ArrayList<>();
} 