package com.jerryvux.shopeeline.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Shopeeline API",
                version = "1.0.0",
                description = "RESTful API for Shopeeline System"
        ),
        servers = {
            @Server(url = "http://localhost:8888/api", description = "Localhost Development Server"),
            @Server(url = "http://10.0.2.2:8888/api", description = "Android Emulator Server"),}
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class SwaggerConfig {

}
