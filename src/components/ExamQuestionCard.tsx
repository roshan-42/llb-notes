'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { parseMarkdown } from '@/lib/markdown';
import { processHtmlWithMath } from '@/lib/katex-utils';

interface ExamQuestionCardProps {
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
  language: 'en' | 'np';
}

const isHtml = (content: string) => content.trim().startsWith('<');

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
          {isHtml(answer) ? (
            <div
              className={`prose prose-invert max-w-none prose-sm
                [&_.ProseMirror]:outline-none
                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:my-2
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:my-2
                [&_h3]:font-semibold [&_h3]:text-white [&_h3]:my-1
                [&_p]:text-gray-200 [&_p]:my-1 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-1
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-1
                [&_li]:text-gray-200 [&_li]:my-0.5
                [&_strong]:font-bold [&_strong]:text-white
                [&_em]:italic [&_em]:text-gray-300
                [&_u]:underline [&_u]:underline-offset-2
                [&_code]:bg-slate-900 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-orange-400 [&_code]:text-sm
                [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-1
                [&_blockquote]:border-l-4 [&_blockquote]:border-amber-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-1
                [&_a]:text-blue-400 [&_a]:underline
                [&_table]:border-collapse [&_table]:w-full [&_table]:my-2
                [&_thead]:bg-slate-800
                [&_th]:border [&_th]:border-slate-600 [&_th]:px-3 [&_th]:py-2 [&_th]:text-white [&_th]:font-semibold [&_th]:text-left
                [&_td]:border [&_td]:border-slate-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-200
                [&_tbody_tr]:hover:bg-slate-800/50 ${
                language === 'np' ? 'text-lg' : 'text-base'
              }`}
              dangerouslySetInnerHTML={{ __html: processHtmlWithMath(answer) }}
            />
          ) : (
            <p className={`text-gray-200 leading-relaxed ${
              language === 'np' ? 'text-lg' : 'text-base'
            }`}>
              {parseMarkdown(answer)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
