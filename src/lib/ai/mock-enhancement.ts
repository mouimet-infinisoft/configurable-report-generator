/**
 * Mock implementation for text enhancement when API key is not available
 */
export function mockEnhanceText(text: string): string {
  // Simple formatting to make it look like it was enhanced
  const paragraphs = text.split(/\n\s*\n/);
  
  // Create a simple introduction
  const introduction = "# Introduction\n\nThis report provides a comprehensive analysis based on the provided information.\n\n";
  
  // Create content sections
  const contentSections = paragraphs.map((para, index) => {
    if (index === 0) return para; // Skip first paragraph as it's used in intro
    
    const sectionTitle = `# Section ${index}\n\n`;
    return sectionTitle + para.trim();
  }).join("\n\n");
  
  // Create a simple conclusion
  const conclusion = "\n\n# Conclusion\n\nBased on the analysis presented in this report, several key findings have been identified. These findings provide valuable insights for future decision-making and strategic planning.";
  
  // Combine all parts
  return introduction + contentSections + conclusion;
}
