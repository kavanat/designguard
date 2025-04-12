package com.positionbook.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeEvent {
    @NotNull
    private String id;

    @NotNull
    private TradeAction action;

    @NotNull
    private String account;

    @NotNull
    private String security;

    @NotNull
    @Positive
    private Long quantity;

    private boolean active = true;

    public enum TradeAction {
        BUY, SELL, CANCEL
    }
} 