'use client';

import React from 'react';
import { Page, Image, View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    objectFit: 'contain',
    maxWidth: '100%',
    maxHeight: '100%',
  },
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

interface PDFImagePageProps {
  imageData: string;
  imageIndex: number;
  totalImages: number;
  pageNumber: number;
  totalPages: number;
  showFooter?: boolean;
  paperSize?: 'A4' | 'LETTER' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
}

export function PDFImagePage({
  imageData,
  imageIndex,
  totalImages,
  pageNumber,
  totalPages,
  showFooter = false,
  paperSize = 'LETTER',
  orientation = 'portrait'
}: PDFImagePageProps) {
  return (
    <Page size={paperSize} orientation={orientation} style={styles.page}>
      <View style={styles.imageContainer}>
        <Image src={imageData} style={styles.image} />
      </View>
      
      {showFooter && (
        <View style={styles.footer} fixed>
          <Text>
            Attachment {imageIndex + 1} of {totalImages} | Page {pageNumber} of {totalPages}
          </Text>
        </View>
      )}
    </Page>
  );
}
