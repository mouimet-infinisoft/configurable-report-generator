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

You MUST follow this EXACT template structure. Fill in the sections with relevant information from the raw text. If information for a section is not available in the raw text, make a reasonable inference based on the available information. Ensure the report is written in formal, professional French with proper grammar and vocabulary.

Here is a complete example of the expected format:

# Rapport d'Évaluation

**Nom du chauffeur :** Oussama Leheouir
**Date :** 15 avril 2025
**Évaluateur :** Richard Ouimet

---

## Contexte de l'Évaluation

Cette évaluation a pour but de vérifier les compétences de conduite de M. Stéphane Massé, incluant la maîtrise du véhicule, l'application des règles de sécurité et l'attitude générale au volant dans un contexte professionnel.

---

## Observations Initiales

M. Massé s'est présenté à l'heure, vêtu de manière convenable. Il a démontré du respect et une attitude polie lors de l'accueil.

---

## Observations en Conduite

### Comportement Général

- Dès la sortie du stationnement, M. Massé s'est montré distrait.
- Il ne consulte pas régulièrement ses rétroviseurs, ce qui compromet sa vigilance.
- Lors d'un arrêt au feu, il a affirmé que le feu était rouge alors qu'il était vert.
- Lorsque je lui ai demandé s'il avait un problème de vision, il a répondu non.

### Réactions aux Situations Routières

- Sur la rue de la Commune, il a détourné son attention vers la Grande Roue, qu'il a trouvée belle, mais a cessé de regarder devant lui.
- Il s'est alors engagé dans la voie inverse, face à d'autres véhicules. J'ai dû intervenir immédiatement.
- Il semble distrait malgré mes remarques à ce sujet.
- Il parle fort et fait régulièrement des commentaires sur les autres conducteurs, les taxis et les motos.

### Maîtrise Technique

- Il éprouve de la difficulté à freiner de manière douce et sécuritaire.
- Il ne maîtrise pas les manœuvres de recul ; le bus ne reculait pas correctement sous sa conduite.
- Les virages, à droite comme à gauche, ont été difficiles à exécuter correctement.
- Lors d'une tentative de virage à droite sur la rue Saint-Antoine, il était mal positionné : il était sur la voie du centre au lieu de celle de droite.
- Il n'a pas arrêté au retour à la voie ferrée malgré mes instructions données à l'aller. Lorsqu'interrogé, il a simplement dit : « J'ai oublié. »

### Réceptivité aux Commentaires

- Malgré les conseils prodigués, M. Massé a affirmé que sa méthode de conduite était préférable.
- Il montre peu de réceptivité à la correction et semble peu disposé à ajuster son comportement de conduite.

---

## Conclusion et Recommandations

M. Stéphane Massé présente plusieurs lacunes sérieuses concernant la sécurité et le contrôle du véhicule. Son manque de vigilance, ses réflexes incertains, ainsi que sa réticence à corriger ses méthodes compromettent sa capacité à assurer un service de conduite sécuritaire.

### Recommandations

- **Non recommandé** pour un poste de conduite sans formation complémentaire.
- Une **supervision accrue** et un **programme de réentraînement obligatoire** sont nécessaires avant toute réévaluation.
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
