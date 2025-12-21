package com.pointer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PointerApplication {
    public static void main(String[] args) {
        SpringApplication.run(PointerApplication.class, args);
    }
}

