'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import AdminNoteBlockEditor, { NoteBlock } from './AdminNoteBlockEditor';

interface Note {
  id: number;
  title_en: string;
  title_np: string;
  content_en: string;
  order: number;
  chapterId: number;
}

interface Question {
  id: number;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
  chapterId: number;
}

interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
  order: number;
  subjectId: number;
  notes: Note[];
}

interface Subject {
  id: number;
  name_en: string;
  name_np: string;
  slug: string;
  yearId: number;
  year: { year: number };
  chapters: Chapter[];
}

export default function AdminDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [contentType, setContentType] = useState<'notes' | 'questions'>('notes');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/admin/subjects');
        const data = await res.json();
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubject(data[0]);
          if (data[0].chapters.length > 0) {
            setExpandedChapters(new Set([data[0].chapters[0].id]));
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        setError('Failed to load subjects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleAddNote = (chapter: Chapter) => {
    const newNote: Note = {
      id: 0, // Temporary ID
      title_en: '',
      title_np: '',
      content_en: '',
      order: (chapter.notes.length || 0) + 1,
      chapterId: chapter.id
    };
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  const parseBlocks = (content_en: string): NoteBlock[] => {
    if (!content_en || content_en === '') return [];
    try {
      const parsed = JSON.parse(content_en);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Old format, convert to blocks
      return [{
        id: '1',
        type: 'body',
        content_en: content_en,
        content_np: ''
      }];
    }
    return [];
  };

  const handleSaveNote = async (blocks: NoteBlock[], title_en: string, title_np: string) => {
    if (!selectedNote) return;

    setIsSaving(true);
    try {
      const method = selectedNote.id === 0 ? 'POST' : 'PUT';
      const endpoint = method === 'POST' ? '/api/admin/notes' : '/api/admin/notes';

      const payload = method === 'POST'
        ? {
            chapterId: selectedNote.chapterId,
            title_en,
            title_np,
            content_en: JSON.stringify(blocks),
            content_np: '',
            order: selectedNote.order
          }
        : {
            id: selectedNote.id,
            title_en,
            title_np,
            content_en: JSON.stringify(blocks),
            content_np: ''
          };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save note');
      }

      // Refresh data
      const subjectsRes = await fetch('/api/admin/subjects');
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);

      if (selectedSubject) {
        const updated = subjectsData.find((s: Subject) => s.id === selectedSubject.id);
        if (updated) {
          setSelectedSubject(updated);
        }
      }

      setIsEditing(false);
      setSelectedNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Delete this note?')) return;

    try {
      const res = await fetch(`/api/admin/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete note');
      }

      // Refresh data
      const subjectsRes = await fetch('/api/admin/subjects');
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);

      if (selectedSubject) {
        const updated = subjectsData.find((s: Subject) => s.id === selectedSubject.id);
        if (updated) {
          setSelectedSubject(updated);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 w-full">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">LLB Notes Editor</h1>
          <p className="text-gray-400 mt-1">Create and edit bilingual notes with blocks</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4 w-full">
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-700 bg-slate-900 overflow-y-auto">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Subjects</h2>

            {subjects.length === 0 ? (
              <div className="text-gray-400 text-sm">No subjects found</div>
            ) : (
              <div className="space-y-2">
                {subjects.map(subject => (
                  <div key={subject.id}>
                    <button
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSelectedNote(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors border ${
                        selectedSubject?.id === subject.id
                          ? 'bg-amber-600/20 border-amber-600/50 text-amber-400 font-semibold'
                          : 'border-slate-700 text-gray-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-medium">{subject.name_en}</div>
                      <div className="text-xs text-gray-400">Y{subject.year.year}</div>
                    </button>

                    {selectedSubject?.id === subject.id && (
                      <div className="ml-2 mt-2 space-y-1 border-l border-slate-700 pl-2">
                        {subject.chapters.length === 0 ? (
                          <div className="text-xs text-gray-500 px-2 py-1">No chapters</div>
                        ) : (
                          subject.chapters.map(chapter => (
                            <div key={chapter.id}>
                              <button
                                onClick={() => toggleChapter(chapter.id)}
                                className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 transition-colors flex items-center justify-between"
                              >
                                <span className="text-sm text-gray-300">Ch {chapter.order}: {chapter.title_en}</span>
                                {expandedChapters.has(chapter.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>

                              {expandedChapters.has(chapter.id) && (
                                <div className="ml-2 mt-1 space-y-1 border-l border-slate-700 pl-2">
                                  {(chapter.notes && chapter.notes.length === 0) || !chapter.notes ? (
                                    <div className="text-xs text-gray-500 px-2 py-1">No notes</div>
                                  ) : (
                                    (chapter.notes || []).map(note => (
                                      <button
                                        key={note.id}
                                        onClick={() => setSelectedNote(note)}
                                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                                          selectedNote?.id === note.id
                                            ? 'bg-blue-600/30 text-blue-300'
                                            : 'text-gray-400 hover:bg-slate-700'
                                        }`}
                                      >
                                        {note.title_en}
                                      </button>
                                    ))
                                  )}

                                  <button
                                    onClick={() => handleAddNote(chapter)}
                                    className="w-full text-left px-2 py-1 rounded text-xs text-amber-400 hover:bg-slate-700 transition-colors flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    New Note
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {!selectedNote ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  {selectedSubject ? 'Select a note to edit' : 'Select a subject to begin'}
                </div>
                {selectedSubject && selectedSubject.chapters.length > 0 && (
                  <button
                    onClick={() => handleAddNote(selectedSubject.chapters[0])}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Note
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              {/* Note Header */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">{selectedNote.title_en}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:border-red-900 hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{selectedNote.title_np}</p>
              </div>

              {/* Note Content Preview */}
              <div className="space-y-4">
                {parseBlocks(selectedNote.content_en).map((block, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-xs font-medium text-amber-400 mb-3 uppercase">
                      {block.type}
                    </div>
                    {block.type === 'image' ? (
                      <div className="space-y-4">
                        {block.content_en && (
                          <div>
                            <img
                              src={block.content_en}
                              alt="Block"
                              className="max-w-full h-auto rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {block.content_np && block.content_np !== block.content_en && (
                          <div>
                            <img
                              src={block.content_np}
                              alt="Block"
                              className="max-w-full h-auto rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : block.type === 'heading' ? (
                      <h1 className="text-3xl font-bold text-white">{block.content_en || block.content_np}</h1>
                    ) : block.type === 'subheading' ? (
                      <h2 className="text-2xl font-semibold text-white">{block.content_en || block.content_np}</h2>
                    ) : (
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {block.content_en || block.content_np}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Editor Modal */}
      {isEditing && selectedNote && (
        <AdminNoteBlockEditor
          initialBlocks={parseBlocks(selectedNote.content_en)}
          noteTitle_en={selectedNote.title_en}
          noteTitle_np={selectedNote.title_np}
          onSave={handleSaveNote}
          onCancel={() => {
            setIsEditing(false);
          }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
