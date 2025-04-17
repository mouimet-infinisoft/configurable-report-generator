'use client';

import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { EnhancementResult } from '@/lib/ai/text-enhancement';

// Create styles
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 12,
    flex: 1,
  },
  itemPage: {
    fontSize: 12,
    marginLeft: 10,
  },
  line: {
    borderBottom: '1 dotted #CCCCCC',
    flex: 1,
    marginBottom: 3,
    marginLeft: 5,
    marginRight: 5,
  },
});

interface PDFTableOfContentsProps {
  enhancementResult: EnhancementResult;
}

export function PDFTableOfContents({ enhancementResult }: PDFTableOfContentsProps) {
  const { sections } = enhancementResult;
  
  if (!sections || sections.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table of Contents</Text>
      
      {sections.map((section, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.itemText}>{section.title}</Text>
          <View style={styles.line} />
          <Text style={styles.itemPage}>1</Text>
        </View>
      ))}
    </View>
  );
}
