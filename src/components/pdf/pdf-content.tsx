'use client';

import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { EnhancementResult } from '@/lib/ai/text-enhancement';

// Create styles
const styles = StyleSheet.create({
  content: {
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottom: '1 solid #EEEEEE',
    paddingBottom: 3,
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  paragraph: {
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 1.5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  plainText: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

interface PDFContentProps {
  enhancementResult: EnhancementResult;
}

export function PDFContent({ enhancementResult }: PDFContentProps) {
  const { sections, enhancedText } = enhancementResult;

  // Helper function to process markdown and split text into paragraphs
  const renderParagraphs = (text: string) => {
    // Split text into paragraphs (empty lines)
    return text.split(/\n\s*\n/).map((paragraph, i) => {
      // Process the paragraph to handle markdown and line breaks
      return (
        <View key={i} style={styles.paragraph}>
          {renderFormattedText(paragraph)}
        </View>
      );
    });
  };

  // Helper function to render text with formatting
  const renderFormattedText = (text: string) => {
    // Handle special case for horizontal rules (---)
    if (text.trim() === '---') {
      return <View style={{ borderBottom: '1 solid #CCCCCC', marginVertical: 10 }} />;
    }

    // Replace single line breaks with spaces, but preserve intentional line breaks
    // marked with double spaces at the end of a line
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // Check if the line contains bold text
      const boldPattern = /\*\*(.*?)\*\*/g;
      let match;
      let lastIndex = 0;
      const elements = [];
      let elementIndex = 0;

      // Process each bold section in the line
      while ((match = boldPattern.exec(line)) !== null) {
        // Add text before the bold section
        if (match.index > lastIndex) {
          elements.push(
            <Text key={`${lineIndex}-${elementIndex++}`}>
              {line.substring(lastIndex, match.index)}
            </Text>
          );
        }

        // Add the bold text
        elements.push(
          <Text key={`${lineIndex}-${elementIndex++}`} style={styles.boldText}>
            {match[1]}
          </Text>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add any remaining text after the last bold section
      if (lastIndex < line.length) {
        elements.push(
          <Text key={`${lineIndex}-${elementIndex++}`}>
            {line.substring(lastIndex)}
          </Text>
        );
      }

      // If no bold sections were found, just add the whole line
      if (elements.length === 0) {
        elements.push(
          <Text key={`${lineIndex}-0`}>
            {line}
          </Text>
        );
      }

      // Return the line with proper line breaks
      return (
        <Text key={lineIndex}>
          {elements}
          {lineIndex < lines.length - 1 ? ' ' : ''}
        </Text>
      );
    });
  };

  if (sections && sections.length > 0) {
    return (
      <View style={styles.content}>
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {renderParagraphs(section.content)}
            </View>
          </View>
        ))}
      </View>
    );
  }

  // If no sections, render the raw enhanced text
  return (
    <View style={styles.content}>
      <View style={styles.plainText}>
        {renderParagraphs(enhancedText)}
      </View>
    </View>
  );
}
