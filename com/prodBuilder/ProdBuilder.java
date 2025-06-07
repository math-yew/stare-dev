package com.prodBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

public class ProdBuilder {

    public static void main(String[] args) {
        String projectPath = "."; // Explicitly set the path relative to where you're running Java from
        String destinationPath = "C:\\\\Users\\\\mathu\\\\GitHub\\\\starebox - prod";
        try {
            System.out.println("Running npm run build...");
            runCommand(projectPath, true, "C:\\Program Files\\nodejs\\npm.cmd", "run", "build");

            System.out.println("\nBuild complete. Copying 'out' folder to 'prod-space'...");
            // copyDirectory(projectPath + "/out", projectPath + "/../prod-space");
            copyDirectory(projectPath + "/out", destinationPath);

            System.out.println("\nStarting concurrent processes...");

            // Create a thread for http-server
            Thread httpServerThread = new Thread(() -> {
                try {
                    System.out.println("Running http-server in 'prod-space'...");
                    runCommand(destinationPath, false, "C:\\Program Files\\nodejs\\npm.cmd", "exec", "http-server");
                } catch (IOException | InterruptedException e) {
                    e.printStackTrace();
                }
            });

            // Create a thread for npm run dev
            Thread npmDevThread = new Thread(() -> {
                try {
                    System.out.println("Running npm run dev...");
                    runCommand(projectPath, false, "C:\\Program Files\\nodejs\\npm.cmd", "run", "dev");
                } catch (IOException | InterruptedException e) {
                    e.printStackTrace();
                }
            });

            // Start both threads
            httpServerThread.start();
            npmDevThread.start();

            System.out.println("\nConcurrent processes started. Main thread continues...");

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    private static void runCommand(String directory, Boolean wait, String... command) throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(new java.io.File(directory));
        processBuilder.redirectOutput(ProcessBuilder.Redirect.INHERIT);
        processBuilder.redirectError(ProcessBuilder.Redirect.INHERIT);

        Process process = processBuilder.start(); // Start the process

        if (wait) {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                System.err.println("Command failed with exit code: " + exitCode);
            }
        }
    }

    private static void copyDirectory(String sourceDir, String destDir) throws IOException {
        Path source = Paths.get(sourceDir);
        Path destination = Paths.get(destDir);
        Files.walk(source).forEach(s -> {
            try {
                Path d = destination.resolve(source.relativize(s));
                if (Files.isDirectory(s)) {
                    Files.createDirectories(d);
                } else {
                    Files.copy(s, d, StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }
}