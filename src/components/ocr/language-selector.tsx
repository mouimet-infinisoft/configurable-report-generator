'use client';

// No useState needed here
import { OCRLanguage } from '@/lib/ocr/types';

interface LanguageSelectorProps {
  value: OCRLanguage;
  onChange: (language: OCRLanguage) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled = false }: LanguageSelectorProps) {
  const languages: { value: OCRLanguage; label: string }[] = [
    { value: 'fra', label: 'French' },
    { value: 'eng+fra', label: 'English & French' },
    { value: 'eng', label: 'English' },
  ];

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="language-selector" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        OCR Language
      </label>
      <select
        id="language-selector"
        value={value}
        onChange={(e) => onChange(e.target.value as OCRLanguage)}
        disabled={disabled}
        className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {languages.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Select the language of the text in your images. French is recommended for evaluation reports.
      </p>
    </div>
  );
}
