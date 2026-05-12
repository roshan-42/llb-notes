import { useState } from 'react';
import { Globe } from 'lucide-react';

interface DualLanguageToggleProps {
  onLanguageChange: (language: 'en' | 'np') => void;
  currentLanguage?: 'en' | 'np';
}

export default function DualLanguageToggle({
  onLanguageChange,
  currentLanguage = 'en'
}: DualLanguageToggleProps) {
  const [language, setLanguage] = useState<'en' | 'np'>(currentLanguage);

  const handleToggle = (lang: 'en' | 'np') => {
    setLanguage(lang);
    onLanguageChange(lang);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
      <Globe className="w-4 h-4 text-amber-500" />

      <button
        onClick={() => handleToggle('en')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-amber-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-slate-700'
        }`}
        aria-pressed={language === 'en'}
      >
        English
      </button>

      <button
        onClick={() => handleToggle('np')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          language === 'np'
            ? 'bg-amber-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-slate-700'
        }`}
        aria-pressed={language === 'np'}
      >
        नेपाली
      </button>
    </div>
  );
}
