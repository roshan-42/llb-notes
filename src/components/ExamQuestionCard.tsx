'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const typeLabel = type === 'past' ? 'Past Question' : 'Possible Question';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-amber-600/40 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 border-b border-slate-700">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          type === 'past'
            ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
            : 'bg-slate-600/50 text-slate-300 border border-slate-600'
        }`}>
          {typeLabel}
        </span>
      </div>

      {/* Question */}
      <div className="px-6 py-4">
        <p className={`text-sm font-medium text-gray-300 mb-3 ${
          language === 'np' ? 'text-lg leading-relaxed' : ''
        }`}>
          {question}
        </p>

        {/* Toggle Button */}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/30 hover:border-amber-600/50 text-amber-400 font-medium transition-all duration-200"
          aria-expanded={showAnswer}
        >
          {showAnswer ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Answer
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Answer
            </>
          )}
        </button>
      </div>

      {/* Answer (Collapsible) */}
      {showAnswer && (
        <div className="border-t border-slate-700 bg-slate-900/50 px-6 py-4">
          <div className="mb-2">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
              Answer
            </span>
          </div>
          <p className={`text-gray-200 leading-relaxed ${
            language === 'np' ? 'text-lg' : 'text-base'
          }`}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
