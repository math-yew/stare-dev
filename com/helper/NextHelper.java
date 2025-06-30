package com.helper;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class NextHelper extends JFrame implements ActionListener {

    private JTextField fileNameField;
    private JButton createButton;
    private JButton doneButton;
    private JLabel messageLabel;

    public NextHelper() {
        setTitle("Component Creator");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new FlowLayout());

        fileNameField = new JTextField(20);
        createButton = new JButton("Create Component");
        doneButton = new JButton("Done");
        messageLabel = new JLabel("");

        createButton.addActionListener(this);
        doneButton.addActionListener(this);

        add(new JLabel("Enter component name:"));
        add(fileNameField);
        add(createButton);
        add(doneButton);
        add(messageLabel);

        pack();
        setLocationRelativeTo(null); // Center the window
        setVisible(true);
    }
    
    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == createButton) {
            String fileName = fileNameField.getText().trim();
            if (!fileName.isEmpty()) {
                String capitalizedFileName = capitalizeFirstLetter(fileName);
                String lowerCaseFileName = fileName.toLowerCase();
                String targetDirectory = "./src/app/_components/illusions/";
                File newFile = new File(targetDirectory + capitalizedFileName + ".tsx");
                
                try {
                    // Create directories if they don't exist
                    new File(targetDirectory).mkdirs();
                    
                    // Read the template file
                    String templateContent = "import { useEffect, useRef, useState } from 'react';\n\n" +
                    "export default function Template() {\n\n}";
                    
                    // Replace "Template" with the new component name
                    String newContent = templateContent.replace("Template", capitalizedFileName);
                    
                    // Write to the new file
                    Files.write(newFile.toPath(), newContent.getBytes());
                    
                    // Update all relevant files
                    updateCentralSquare(capitalizedFileName, lowerCaseFileName);
                    updateSquareView(capitalizedFileName, lowerCaseFileName);
                    updatePageTsx(lowerCaseFileName);
                    
                    // Create thumbnail
                    createThumbnail(lowerCaseFileName);
                    
                    messageLabel.setText("Component '" + capitalizedFileName + ".tsx' created successfully and all related files updated.");
                } catch (IOException ex) {
                    messageLabel.setText("Error: " + ex.getMessage());
                }
                fileNameField.setText(""); // Clear the input field
            } else {
                messageLabel.setText("Please enter a component name.");
            }
        } else if (e.getSource() == doneButton) {
            dispose(); // Close the JFrame
            System.exit(0); // Terminate the application
        }
    }
    
    private void updateCentralSquare(String componentName, String lowerCaseName) throws IOException {
        Path centralSquarePath = Paths.get("./src/app/_components/CentralSquare.tsx");
        String content = new String(Files.readAllBytes(centralSquarePath));
        
        // Check if import already exists
        if (!content.contains("import " + componentName + " from './illusions/" + componentName + "';")) {
            // Add import statement
            String importSection = "// End of Imports";
            String newImport = "import " + componentName + " from './illusions/" + componentName + "';\n" + importSection;
            content = content.replace(importSection, newImport);
        }
        
        // Check if conditional already exists
        if (!content.contains("if(props.slug?.toLowerCase() == \"" + lowerCaseName + "\")")) {
            // Add conditional statement
            String contentSection = "// End of content section";
            String newContent = "if(props.slug?.toLowerCase() == \"" + lowerCaseName + "\") \n" +
                                "    content = <" + componentName + " />\n  " + contentSection;
            content = content.replace(contentSection, newContent);
        }
        
        Files.write(centralSquarePath, content.getBytes());
    }
    
    private void updateSquareView(String componentName, String lowerCaseName) throws IOException {
        Path squareViewPath = Paths.get("./src/app/_components/SquareView.tsx");
        String content = new String(Files.readAllBytes(squareViewPath));
        
        // Check if import already exists
        if (!content.contains("import " + componentName + " from './illusions/" + componentName + "';")) {
            // Add import statement
            String importSection = "// End of Imports";
            String newImport = "import " + componentName + " from './illusions/" + componentName + "';\n" + importSection;
            content = content.replace(importSection, newImport);
        }
        
        // Check if SideSquare already exists
        if (!content.contains("<SideSquare link=\"/" + lowerCaseName + "\"")) {
            // Add SideSquare component
            String sideSquareSection = "{/*  End of side squares */}";
            String newSideSquare = "<SideSquare link=\"/" + lowerCaseName + "\" title=\"" + componentName + "\" imageName=\"thumbnails/" + lowerCaseName + " thumbnail.jpg\"/>\n        " + sideSquareSection;
            content = content.replace(sideSquareSection, newSideSquare);
        }
        
        Files.write(squareViewPath, content.getBytes());
    }
    
    private void updatePageTsx(String lowerCaseName) throws IOException {
        Path pageTsxPath = Paths.get("./src/app/[square]/page.tsx");
        String content = new String(Files.readAllBytes(pageTsxPath));
        
        // Check if illusion slug already exists
        if (!content.contains("'" + lowerCaseName + "',")) {
            // Add to illusions array
            String illusionSection = "// End of illusion slugs";
            String newIllusion = "'" + lowerCaseName + "', \n    " + illusionSection;
            content = content.replace(illusionSection, newIllusion);
        }
        
        Files.write(pageTsxPath, content.getBytes());
    }
    
    private void createThumbnail(String lowerCaseName) throws IOException {
        Path sourceThumbnail = Paths.get("./public/thumbnails/template thumbnail.jpg");
        Path targetThumbnail = Paths.get("./public/thumbnails/" + lowerCaseName + " thumbnail.jpg");
        
        // Create thumbnails directory if it doesn't exist
        Files.createDirectories(targetThumbnail.getParent());
        
        // Copy the template thumbnail to the new location
        Files.copy(sourceThumbnail, targetThumbnail);
    }

    private String capitalizeFirstLetter(String name) {
        if (name == null || name.isEmpty()) {
            return name;
        }
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }

    public static void main(String[] args) {
        // Ensure the UI is created on the Event Dispatch Thread
        SwingUtilities.invokeLater(NextHelper::new);
    }
}