package com.codekids;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(WebSocketConfig.class);

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new EchoHandler(), "/ws").setAllowedOrigins("*");
        logger.info("WebSocket mapped to /ws");
    }

    private static class EchoHandler extends TextWebSocketHandler {
        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            logger.info("WebSocket connection established: {}", session.getId());
            super.afterConnectionEstablished(session);
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
            logger.info("WebSocket connection closed: {} with status: {}", session.getId(), status);
            super.afterConnectionClosed(session, status);
        }

        @Override
        public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            logger.info("Received message from {}: {}", session.getId(), message.getPayload());
            session.sendMessage(new TextMessage(message.getPayload()));
        }
    }
}
