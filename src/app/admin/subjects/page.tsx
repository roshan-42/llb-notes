'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';

interface Subject {
  id: number;
  name_en: string;
  name_np: string;
  slug: string;
  year: { year: number };
  chapters: Array<any>;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/admin/subjects');
        const data = await res.json();
        setSubjects(data);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        setSubjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const groupedByYear = subjects.reduce(
    (acc, subject) => {
      const year = subject.year.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(subject);
      return acc;
    },
    {} as Record<number, Subject[]>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">Manage Subjects</h1>
              <p className="text-gray-400 mt-1">Create, edit, or delete subjects and chapters</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New Subject
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading subjects...</div>
          </div>
        ) : Object.entries(groupedByYear).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">No subjects found</div>
          </div>
        ) : (
          <>
        {Object.entries(groupedByYear).map(([year, yearSubjects]) => (
          <div key={year} className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Year {year}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yearSubjects.map(subject => (
                <div
                  key={subject.id}
                  className="border border-slate-700 bg-slate-800 rounded-lg p-6 hover:border-amber-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{subject.name_en}</h3>
                      <p className="text-gray-400 text-sm">{subject.name_np}</p>
                    </div>
                    {subject.icon && <span className="text-2xl">{subject.icon}</span>}
                  </div>

                  <div className="mb-4 text-sm text-gray-400">
                    {subject.chapters.length} chapter{subject.chapters.length !== 1 ? 's' : ''}
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    {subject.chapters.map(chapter => (
                      <div key={chapter.id} className="px-2 py-1 rounded bg-slate-700/50 text-gray-300">
                        Chapter {chapter.order}: {chapter.title_en}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-900/50 text-red-400 hover:border-red-900 hover:bg-red-900/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </>
        )}
      </div>
    </div>
  );
}
