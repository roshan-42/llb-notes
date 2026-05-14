'use client';

import { useState, useEffect } from 'react';
import DualLanguageToggle from '@/components/DualLanguageToggle';
import NoteBlockRenderer from '@/components/NoteBlockRenderer';
import { useChapters, type Note } from '@/lib/hooks/useChapters';
import { ArrowLeft, ChevronDown, ChevronUp, Menu, X, Loader } from 'lucide-react';
import Link from 'next/link';

interface NotesPageProps {
  params: Promise<{
    year: string;
    slug: string;
  }>;
}

export default function NotesPage({ params }: NotesPageProps) {
  const [paramsData, setParamsData] = useState<{ year: string; slug: string } | null>(null);
  const [language, setLanguage] = useState<'en' | 'np'>('en');
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    params.then(setParamsData);
  }, [params]);

  const { data: chapters = [], isLoading } = useChapters(paramsData?.slug || '');

  useEffect(() => {
    if (chapters.length > 0 && !selectedChapter) {
      setSelectedChapter(chapters[0]);
      setExpandedChapters(new Set([chapters[0].id]));
    }
  }, [chapters, selectedChapter]);

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Menu Button (hamburger) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

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
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              href={paramsData ? `/year/${paramsData.year}/subject/${paramsData.slug}` : '#'}
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-slate-800 transition-colors text-gray-400 hover:text-white"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                    ? 'bg-amber-600/20 border-amber-600/50 text-amber-400 font-semibold'
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
                  {chapter.notes.map(note => (
                    <div
                      key={note.id}
                      className="text-xs px-3 py-2 rounded bg-slate-800/50 text-gray-400 border border-slate-700"
                    >
                      {language === 'en' ? note.title_en : note.title_np}
                    </div>
                  ))}
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
            <div className="sticky top-0 z-30 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm px-4 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-lg lg:text-xl font-semibold text-white truncate">
                {language === 'en' ? selectedChapter.title_en : selectedChapter.title_np}
              </h1>
              <DualLanguageToggle
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>

            {/* Content */}
            <div className="p-4 lg:p-8 space-y-8">
              {selectedChapter.notes.map((note: Note) => (
                <article
                  key={note.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {language === 'en' ? note.title_en : note.title_np}
                  </h2>
                  <div className={language === 'np' ? 'text-lg' : ''}>
                    <NoteBlockRenderer
                      content={language === 'en' ? note.content_en : note.content_np || note.content_en}
                      language={language}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
