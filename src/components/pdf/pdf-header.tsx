'use client';

import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #EEEEEE',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 5,
  },
  meta: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
  },
});

interface PDFHeaderProps {
  title: string;
  author?: string;
  date?: string;
}

export function PDFHeader({ title, author = '', date = new Date().toLocaleDateString() }: PDFHeaderProps) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>
        {author ? `Author: ${author} | ` : ''}
        Date: {date}
      </Text>
    </View>
  );
}
