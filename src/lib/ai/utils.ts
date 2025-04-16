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
  let prompt = `
I need you to transform the following raw text (extracted from OCR) into a well-structured, professional report.

Language: ${actualLanguage}
Report Type: ${reportType}
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}

Here's the raw text:
---
${text}
---

`; 

  // Add French-specific template if language is French
  if (actualLanguage.toLowerCase().includes('french') || actualLanguage.toLowerCase().includes('français')) {
    prompt += `
Please format the report following this French report structure:

1. "Rapport d'Évaluation" as the main title
2. Basic information at the top (name, date, etc.)
3. "Contexte de l'Évaluation" section explaining the purpose of the evaluation
4. "Observations Initiales" section with initial observations
5. "Observations en Conduite" section with detailed observations, which may include subsections like "Maîtrise Technique"
6. "Conclusion et Recommandations" section summarizing findings
7. "Points à souligner" section with key highlights
8. Evaluator name at the end

Here is an example of the structure to follow:


Rapport dÉvaluation

Nom du chauffeur : Mme Salmouni Ouafae
Date : 10 avril 2025

Madame est arrivée à l'heure et vêtue d'une façon appropriée dès le départ.
Madame est très à l'aise au volant, professionnelle.
Bonne attitude. Peu de fautes de conduite.
Excellente. Rien à dire de négatif.

Contexte de l'Évaluation

Une évaluation des compétences de conduite a été réalisée pour Mme Salmouni Ouafae
afin de vérifier ses aptitudes générales, sa maîtrise du véhicule et sa conformité aux
exigences opérationnelles.

Observations Initiales

Mme Salmouni s'est présentée à l'heure prévue et était vêtue de manière appropriée. Elle a
démontré dès le départ une attitude professionnelle et une grande aisance dans son rôle.

Observations en Conduite

Maîtrise Technique

Mme Salmouni a parfaitement manœuvré le véhicule avec assurance.
Elle a effectué toutes les sorties et entrées de cour de manière fluide et sécuritaire.
Les virages, les arrêts et les reprises ont été réalisés avec précision.
Les manœuvres de recul ont été bien maîtrisées, sans difficulté apparente.

Conclusion et Recommandations

Mme Salmouni démontre toutes les compétences nécessaires pour assurer ce travail de
manière sécuritaire et efficace. Son professionnalisme, sa maîtrise technique et son
comportement en conduite sont exemplaires.

Points à souligner

Aucune recommandation particulière, le niveau de compétence est excellent.
Peut être recommandée sans réserve pour le poste.

Évaluateur : Richard Ouimet

Ensure the report is written in formal, professional French with proper grammar and vocabulary. Adapt the structure to fit the content of the raw text while maintaining this format.
`;
  } else {
    // Standard instructions for other languages
    prompt += `
Please:
1. Correct any spelling or grammar errors
2. Organize the content into logical sections with headings
3. Format the text professionally
4. Maintain all factual information from the original text
5. Add appropriate transitions between sections
6. Use professional language suitable for a formal report
`;
  }

  prompt += `
Return the enhanced text in a clean, well-structured format with clear section headings.
`;

  return prompt;
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
