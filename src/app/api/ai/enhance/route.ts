import { NextRequest, NextResponse } from 'next/server';
import { mockEnhanceText } from '@/lib/ai/mock-enhancement';

export async function POST(req: NextRequest) {
  console.log('AI enhancement API called');
  try {
    const { text, language = 'english', reportType = 'general', additionalInstructions = '' } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check if Together AI API key is configured
    const apiKey = process.env.TOGETHER_API_KEY;
    console.log('Together API key configured:', !!apiKey);

    // If no API key, use mock enhancement instead
    if (!apiKey) {
      console.warn('Together AI API key is not configured, using mock enhancement');
      const enhancedText = mockEnhanceText(text);
      const sections = parseSections(enhancedText);

      return NextResponse.json({
        enhancedText,
        sections
      });
    }

    // Create prompt for text enhancement
    const prompt = createEnhancementPrompt(text, language, reportType, additionalInstructions);

    // Define models to try in order of preference
    const models = [
      'meta-llama/Llama-3.1-8B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.2',
      'gpt-3.5-turbo'
    ];

    // Call Together AI API
    console.log('Calling Together AI API...');
    let lastError = null;

    // Try each model in sequence until one works
    for (const model of models) {
      console.log(`Trying model: ${model}...`);
      try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert report writer who can transform raw text into well-structured, professional reports.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      console.log('Together API response received, status:', response.status);

      // Parse the response JSON only once
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;
      try {
        result = await response.json();
        console.log('Together API response parsed successfully');
      } catch (parseError) {
        console.error(`Error parsing response from model ${model}:`, parseError);
        lastError = new Error('Failed to parse API response');
        // Continue to the next model
        continue;
      }

      if (!response.ok) {
        console.error(`Error with model ${model}:`, result);
        // Handle the error object structure correctly
        const errorMessage = result.error?.message ||
                            (typeof result.error === 'object' ? JSON.stringify(result.error) : result.error) ||
                            'Failed to enhance text';
        lastError = new Error(errorMessage);
        // Continue to the next model
        continue;
      }

      // Success! We got a valid response
      const enhancedText = result.choices?.[0]?.message?.content || '';
      console.log(`Success with model ${model}, text length:`, enhancedText.length);

      // Parse sections if possible
      const sections = parseSections(enhancedText);

      return NextResponse.json({
        enhancedText,
        sections,
        model // Include which model was used
      });
    } catch (apiError) {
        console.error(`Error with model ${model}:`, apiError);
        lastError = apiError;
        // Continue to the next model
      }
    }

    // If we get here, all models failed
    console.error('All models failed, using last error:', lastError);
    return NextResponse.json(
      { error: lastError instanceof Error ? lastError.message : 'All AI models failed' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error enhancing text:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enhance text' },
      { status: 500 }
    );
  }
}

/**
 * Create a prompt for text enhancement based on the input parameters
 */
function createEnhancementPrompt(
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
function parseSections(text: string) {
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
