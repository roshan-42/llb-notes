'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit, AlertCircle, BookOpen } from 'lucide-react';
import AdminSubjectEditor from '@/components/AdminSubjectEditor';
import AdminChapterEditor from '@/components/AdminChapterEditor';

interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
  order: number;
  notes: Array<any>;
}

interface Subject {
  id: number;
  name_en: string;
  name_np: string;
  slug: string;
  icon?: string;
  year: { id: number; year: number };
  chapters: Chapter[];
}

interface Year {
  id: number;
  year: number;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showSubjectEditor, setShowSubjectEditor] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [showChapterEditor, setShowChapterEditor] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'subject' | 'chapter'; id: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, yearsRes] = await Promise.all([
          fetch('/api/admin/subjects'),
          fetch('/api/admin/years')
        ]);
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);

        if (yearsRes.ok) {
          const yearsData = await yearsRes.json();
          setYears(yearsData);
          if (yearsData.length > 0) {
            setSelectedYear(yearsData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewSubject = () => {
    setEditingSubject(null);
    setShowSubjectEditor(true);
    setError(null);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setShowSubjectEditor(true);
    setError(null);
  };

  const handleSaveSubject = async (data: {
    id?: number;
    name_en: string;
    name_np: string;
    icon?: string;
  }) => {
    try {
      const isEditing = !!data.id;
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? data
        : { ...data, yearId: selectedYear };

      const res = await fetch('/api/admin/subjects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save subject');
      }

      const savedSubject = await res.json();

      if (isEditing) {
        setSubjects(subjects.map(s => s.id === savedSubject.id ? savedSubject : s));
      } else {
        setSubjects([...subjects, savedSubject]);
        setSelectedYear(savedSubject.year.id);
      }

      setShowSubjectEditor(false);
      setEditingSubject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subject');
      throw err;
    }
  };

  const handleDeleteSubject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/subjects?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete subject');
      }

      setSubjects(subjects.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject');
    }
  };

  const handleNewChapter = (subject: Subject) => {
    setSelectedSubject(subject);
    setEditingChapter(null);
    setShowChapterEditor(true);
    setError(null);
  };

  const handleEditChapter = (chapter: Chapter, subject: Subject) => {
    setSelectedSubject(subject);
    setEditingChapter(chapter);
    setShowChapterEditor(true);
    setError(null);
  };

  const handleSaveChapter = async (data: {
    id?: number;
    title_en: string;
    title_np: string;
    order: number;
  }) => {
    if (!selectedSubject) return;

    try {
      const isEditing = !!data.id;
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? data
        : { ...data, subjectId: selectedSubject.id };

      const res = await fetch('/api/admin/chapters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save chapter');
      }

      const savedChapter = await res.json();

      setSubjects(subjects.map(s => {
        if (s.id !== selectedSubject.id) return s;

        if (isEditing) {
          return {
            ...s,
            chapters: s.chapters.map(c => c.id === savedChapter.id ? savedChapter : c)
          };
        } else {
          return {
            ...s,
            chapters: [...s.chapters, savedChapter]
          };
        }
      }));

      setShowChapterEditor(false);
      setEditingChapter(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chapter');
      throw err;
    }
  };

  const handleDeleteChapter = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/chapters?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete chapter');
      }

      setSubjects(subjects.map(s => ({
        ...s,
        chapters: s.chapters.filter(c => c.id !== id)
      })));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chapter');
    }
  };

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
              <p className="text-gray-400 mt-1">Create subjects, chapters, and manage content</p>
            </div>
            <button
              onClick={handleNewSubject}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Subject
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

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
                      className="border border-slate-700 bg-slate-800 rounded-lg p-6 hover:border-amber-600/50 transition-colors flex flex-col"
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

                      <div className="space-y-2 mb-6 text-sm max-h-48 overflow-y-auto flex-1">
                        {subject.chapters.length === 0 ? (
                          <div className="text-gray-500 italic">No chapters yet</div>
                        ) : (
                          subject.chapters.map(chapter => (
                            <div
                              key={chapter.id}
                              className="px-3 py-2 rounded bg-slate-700/50 text-gray-300 border border-slate-600 flex items-center justify-between group hover:border-amber-600/50"
                            >
                              <span>
                                Ch {chapter.order}: {chapter.title_en}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditChapter(chapter, subject)}
                                  className="p-1 hover:bg-slate-600 rounded text-xs"
                                  title="Edit"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'chapter', id: chapter.id })}
                                  className="p-1 hover:bg-red-900/30 rounded text-xs"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleNewChapter(subject)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Chapter
                        </button>
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'subject', id: subject.id })}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-900/50 text-red-400 hover:border-red-900 hover:bg-red-900/10 transition-colors text-sm"
                        >
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-sm">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-900">
              <h2 className="text-lg font-semibold text-white">
                {deleteConfirm.type === 'subject' ? 'Delete Subject?' : 'Delete Chapter?'}
              </h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-400">
                {deleteConfirm.type === 'subject'
                  ? 'This action cannot be undone. All chapters and notes in this subject will be deleted.'
                  : 'This action cannot be undone. All notes in this chapter will be deleted.'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'subject') {
                    handleDeleteSubject(deleteConfirm.id);
                  } else {
                    handleDeleteChapter(deleteConfirm.id);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Editor Modal */}
      {showSubjectEditor && (
        <AdminSubjectEditor
          initialData={editingSubject || undefined}
          yearId={selectedYear || 1}
          onSave={handleSaveSubject}
          onCancel={() => {
            setShowSubjectEditor(false);
            setEditingSubject(null);
          }}
        />
      )}

      {/* Chapter Editor Modal */}
      {showChapterEditor && selectedSubject && (
        <AdminChapterEditor
          initialData={editingChapter || undefined}
          subjectId={selectedSubject.id}
          existingChapters={selectedSubject.chapters}
          onSave={handleSaveChapter}
          onDelete={handleDeleteChapter}
          onCancel={() => {
            setShowChapterEditor(false);
            setEditingChapter(null);
            setSelectedSubject(null);
          }}
        />
      )}
    </div>
  );
}
