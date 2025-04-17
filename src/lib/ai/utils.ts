/**
 * Create a prompt for text enhancement based on the input parameters
 */
export function createEnhancementPrompt(
  text: string,
  language: string,
  reportType: string,
  additionalInstructions: string
): string {
  // Default to French if not specified
  const actualLanguage = language || 'french';

  // Base prompt structure
  let promptText = `
I need you to transform the following raw text (extracted from OCR) into a well-structured, professional report.

Language: ${actualLanguage}
Report Type: ${reportType}
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}

Here's the raw text:
---
${text}
---

`;

  // Always use the specific template for all reports, regardless of language
  promptText += `
Please format the report following EXACTLY this template structure:

# Rapport d'Évaluation

**Nom du chauffeur :** [Driver Name]
**Date :** [Current Date]
**Évaluateur :** [Evaluator Name]

---

## Contexte de l'Évaluation

[Purpose of the evaluation, including verification of driving skills, vehicle control, safety rules, and general attitude]

---

## Observations Initiales

[Initial observations about the driver's appearance, punctuality, attitude during welcome]

---

## Observations en Conduite

### Comportement Général

[General behavior observations during driving]

### Réactions aux Situations Routières

[Observations about reactions to road situations]

### Maîtrise Technique

[Technical mastery observations, including vehicle control, maneuvers]

### Réceptivité aux Commentaires

[Observations about receptiveness to feedback]

---

## Conclusion et Recommandations

[Summary of findings and specific recommendations]

### Recommandations

[Specific recommendations about hiring/training needs]

You MUST follow this EXACT template structure with these important rules:
1. ONLY include information that is explicitly mentioned in the raw text
2. DO NOT make any inferences or assumptions about missing information
3. If information for a section is not available in the raw text, either skip that section entirely or clearly state "Information non disponible" in that section
4. DO NOT copy or reuse any specific details from the example format below into your generated report
5. The example below is ONLY to show the structure, not to provide content for your report

Ensure the report is written in formal, professional French with proper grammar and vocabulary.

`;

  promptText += `
Return the enhanced text in a clean, well-structured format with clear section headings.
`;

  return promptText;
}

/**
 * Parse sections from the enhanced text
 */
export function parseSections(text: string) {
  // Simple section parsing based on headings
  const sectionRegex = /^#+\s+(.+)$|^(.+)\n[=\-]+$/gm;
  const sections = [];
  let lastIndex = 0;
  let lastTitle = 'Introduction';

  // Find all section headings
  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    const title = match[1] || match[2];
    const startIndex = match.index;

    // Add the previous section
    if (lastIndex > 0) {
      const content = text.substring(lastIndex, startIndex).trim();
      if (content) {
        sections.push({ title: lastTitle, content });
      }
    } else if (startIndex > 0) {
      // Add content before the first heading as introduction
      const intro = text.substring(0, startIndex).trim();
      if (intro) {
        sections.push({ title: 'Introduction', content: intro });
      }
    }

    lastIndex = startIndex + match[0].length;
    lastTitle = title;
  }

  // Add the last section
  if (lastIndex < text.length) {
    const content = text.substring(lastIndex).trim();
    if (content) {
      sections.push({ title: lastTitle, content });
    }
  }

  // If no sections were found, treat the entire text as one section
  if (sections.length === 0 && text.trim()) {
    sections.push({ title: 'Report', content: text.trim() });
  }

  return sections;
}
