'use client';

import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import DualLanguageToggle from '@/components/DualLanguageToggle';
import NoteBlockRenderer from '@/components/NoteBlockRenderer';
import { ArrowLeft, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
  order: number;
  notes: Note[];
}

interface Note {
  id: number;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
}

interface NotesPageProps {
  params: Promise<{
    year: string;
    slug: string;
  }>;
}

export default function NotesPage({ params }: NotesPageProps) {
  const [paramsData, setParamsData] = useState<{ year: string; slug: string } | null>(null);
  const [language, setLanguage] = useState<'en' | 'np'>('en');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
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
                  setSelectedChapter(chapter);
                  setExpandedChapters(new Set([...expandedChapters, chapter.id]));
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors border ${
                  selectedChapter?.id === chapter.id
                    ? 'bg-amber-600/20 border-amber-600/50 text-amber-400 font-semibold'
                    : 'border-slate-700 text-gray-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    <span className="font-medium">Ch {chapter.order}:</span> {chapter.title_en}
                  </span>
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
              {selectedChapter.notes.map(note => (
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
