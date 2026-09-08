package com.quickmeal.backend;

import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public final class QuickMealApplication {

    public static void main(String[] args) {
        try {
            System.setOut(new PrintStream(System.out, true, StandardCharsets.UTF_8.name()));
            System.setErr(new PrintStream(System.err, true, StandardCharsets.UTF_8.name()));

            final var pb = new ProcessBuilder("cmd", "/c", "chcp 65001");
            pb.inheritIO();
            final var process = pb.start();
            process.waitFor();
        } catch (Exception e) {
            e.printStackTrace();
        }
        SpringApplication.run(QuickMealApplication.class, args);
    }

}
