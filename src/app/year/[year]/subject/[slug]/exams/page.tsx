'use client';

import { useState, useEffect } from 'react';
import DualLanguageToggle from '@/components/DualLanguageToggle';
import ExamQuestionCard from '@/components/ExamQuestionCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
}

interface Question {
  id: number;
  chapterId: number;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
}

interface ExamsPageProps {
  params: Promise<{
    year: string;
    slug: string;
  }>;
}

export default function ExamsPage({ params }: ExamsPageProps) {
  const [paramsData, setParamsData] = useState<{ year: string; slug: string } | null>(null);
  const [language, setLanguage] = useState<'en' | 'np'>('en');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'past' | 'possible'>('all');

  useEffect(() => {
    params.then(setParamsData);
  }, [params]);

  useEffect(() => {
    if (!paramsData) return;

    const fetchChapters = async () => {
      try {
        const res = await fetch(`/api/subjects/${paramsData.slug}/chapters`);
        const data = await res.json();
        setChapters(data);
        if (data.length > 0) {
          setSelectedChapterId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapters();
  }, [paramsData]);

  useEffect(() => {
    if (!selectedChapterId) return;

    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `/api/chapters/${selectedChapterId}/questions`
        );
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [selectedChapterId]);

  const selectedChapter = chapters.find(ch => ch.id === selectedChapterId);

  const filteredQuestions = questions.filter(q =>
    filterType === 'all' ? true : q.type === filterType
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href={paramsData ? `/year/${paramsData.year}/subject/${paramsData.slug}` : '#'}
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subject
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">Exam Questions</h1>
              {selectedChapter && (
                <p className="text-gray-400 mt-1">{selectedChapter.title_en}</p>
              )}
            </div>
            <DualLanguageToggle
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Chapter Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Select Chapter</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {chapters.map(chapter => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedChapterId === chapter.id
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'border-slate-700 text-gray-300 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                {chapter.title_en}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2">
          {['all', 'past', 'possible'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as typeof filterType)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                filterType === type
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'border-slate-700 text-gray-300 hover:border-slate-600'
              }`}
            >
              {type === 'all' ? 'All Questions' : `${type} Questions`}
            </button>
          ))}
        </div>

        {/* Questions */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No questions available for this chapter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <ExamQuestionCard
                key={question.id}
                question_en={question.question_en}
                question_np={question.question_np}
                answer_en={question.answer_en}
                answer_np={question.answer_np}
                type={question.type}
                language={language}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
