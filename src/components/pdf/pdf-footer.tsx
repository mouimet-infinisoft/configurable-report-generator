'use client';

import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666666',
    borderTop: '1 solid #EEEEEE',
    paddingTop: 10,
  },
});

interface PDFFooterProps {
  pageNumber?: number;
  totalPages?: number;
}

export function PDFFooter({ pageNumber, totalPages }: PDFFooterProps) {
  const pageInfo = pageNumber && totalPages ? `Page ${pageNumber} of ${totalPages}` : '';
  
  return (
    <View style={styles.footer} fixed>
      <Text>
        Generated on {new Date().toLocaleDateString()} 
        {pageInfo && ` | ${pageInfo}`}
      </Text>
    </View>
  );
}
