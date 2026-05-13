'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { parseMarkdown } from '@/lib/markdown';

interface ExamQuestionCardProps {
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
  language: 'en' | 'np';
}

export default function ExamQuestionCard({
  question_en,
  question_np,
  answer_en,
  answer_np,
  type,
  language
}: ExamQuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const question = language === 'en' ? question_en : question_np;
  const answer = language === 'en' ? answer_en : answer_np;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-6 py-4 hover:border-amber-600/40 transition-colors">
      {/* Top row: Question + Type badge + Eye icon */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          {/* Question */}
          <p className={`text-sm font-medium text-gray-300 ${
            language === 'np' ? 'text-lg leading-relaxed' : ''
          }`}>
            {question}
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Type badge */}
          <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            type === 'past'
              ? 'bg-amber-600/20 text-amber-400'
              : 'bg-slate-600/50 text-slate-300'
          }`}>
            {type === 'past' ? 'Past' : 'Possible'}
          </span>

          {/* Eye icon */}
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors text-gray-400 hover:text-amber-400"
            aria-label={showAnswer ? 'Hide answer' : 'Show answer'}
          >
            {showAnswer ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Answer (inline) */}
      {showAnswer && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className={`text-gray-200 leading-relaxed ${
            language === 'np' ? 'text-lg' : 'text-base'
          }`}>
            {parseMarkdown(answer)}
          </p>
        </div>
      )}
    </div>
  );
}
