'use client';

import { useState, useEffect } from 'react';
import DualLanguageToggle from '@/components/DualLanguageToggle';
import ExamQuestionCard from '@/components/ExamQuestionCard';
import { ArrowLeft, Menu, X, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
  order: number;
  questions: Question[];
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
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'past' | 'possible'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
          setSelectedChapter(data[0]);
          setExpandedChapters(new Set([data[0].id]));
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapters();
  }, [paramsData]);

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const filteredQuestions = selectedChapter
    ? selectedChapter.questions.filter(q =>
        filterType === 'all' ? true : q.type === filterType
      )
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative w-80 border-r border-slate-700 bg-slate-900 h-screen overflow-y-auto z-40 transition-transform lg:transition-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-slate-700">
          <Link
            href={paramsData ? `/year/${paramsData.year}/subject/${paramsData.slug}` : '#'}
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h2 className="text-lg font-semibold text-white">Chapters</h2>
        </div>

        <div className="p-6 space-y-2">
          {chapters.map(chapter => (
            <div key={chapter.id}>
              <button
                onClick={() => {
                  if (isTransitioning) return;
                  setIsTransitioning(true);
                  setSelectedChapter(chapter);
                  setExpandedChapters(new Set([...expandedChapters, chapter.id]));
                  setSidebarOpen(false);
                  setTimeout(() => setIsTransitioning(false), 500);
                }}
                disabled={isTransitioning}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors border ${
                  selectedChapter?.id === chapter.id
                    ? 'bg-purple-600/20 border-purple-600/50 text-purple-400 font-semibold'
                    : 'border-slate-700 text-gray-300 hover:bg-slate-800'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    <span className="font-medium">Ch {chapter.order}:</span> {chapter.title_en}
                  </span>
                  {isTransitioning && selectedChapter?.id === chapter.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleChapter(chapter.id);
                      }}
                    >
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </button>

              {expandedChapters.has(chapter.id) && (
                <div className="ml-4 mt-2 space-y-1">
                  <div className="text-xs px-3 py-2 text-gray-500">
                    {chapter.questions.filter(q => q.type === 'past').length} past • {chapter.questions.filter(q => q.type === 'possible').length} possible
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto pt-16 lg:pt-0">
        {selectedChapter && (
          <>
            {/* Top Bar */}
            <div className="sticky top-0 z-30 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm px-4 lg:px-8 py-4 flex justify-between items-center gap-4">
              <h1 className="text-lg lg:text-xl font-semibold text-white truncate">
                {language === 'en' ? selectedChapter.title_en : selectedChapter.title_np}
              </h1>
              <DualLanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>

            {/* Filter Tabs */}
            <div className="sticky top-14 lg:top-16 z-20 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm px-4 lg:px-8 py-3 flex gap-2 overflow-x-auto">
              {['all', 'past', 'possible'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as typeof filterType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                    filterType === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'past' ? 'Past' : 'Possible'}
                </button>
              ))}
            </div>

            {/* Questions */}
            <div className="p-4 lg:p-8">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No {filterType === 'all' ? '' : filterType} questions in this chapter</p>
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
          </>
        )}
      </main>
    </div>
  );
}
