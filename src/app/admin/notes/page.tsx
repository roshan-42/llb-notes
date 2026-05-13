'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import AdminNoteEditor from '@/components/AdminNoteEditor';
import { updateNote, deleteNote } from '@/lib/actions';

interface Chapter {
  id: number;
  title_en: string;
  order: number;
  subject: {
    id: number;
    name_en: string;
    year: {
      id: number;
      year: number;
    };
  };
}

interface Note {
  id: number;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  order: number;
  chapter: Chapter;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, chaptersRes] = await Promise.all([
          fetch('/api/admin/notes'),
          fetch('/api/admin/chapters')
        ]);
        const notesData = await notesRes.json();
        const chaptersData = await chaptersRes.json();
        setNotes(notesData);
        setChapters(chaptersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setSelectedChapter(note.chapter);
    setIsEditing(true);
    setError(null);
  };

  const handleNew = () => {
    setSelectedNote(null);
    setSelectedChapter(null);
    setIsCreating(true);
    setError(null);
  };

  const handleSave = async (data: {
    title_en: string;
    title_np: string;
    content_en: string;
    content_np: string;
  }) => {
    try {
      if (isEditing && selectedNote) {
        const result = await updateNote(selectedNote.id, data);
        if (result.success) {
          setNotes(notes.map(n => (n.id === selectedNote.id ? { ...n, ...data } : n)));
          setIsEditing(false);
          setSelectedNote(null);
        } else {
          throw new Error(result.error || 'Failed to update note');
        }
      } else if (isCreating && selectedChapter) {
        const res = await fetch('/api/admin/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            chapterId: selectedChapter.id,
            order: (notes.filter(n => n.chapter.id === selectedChapter.id).length || 0) + 1
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create note');
        }

        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setIsCreating(false);
        setSelectedNote(null);
        setSelectedChapter(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this note?')) return;

    try {
      const result = await deleteNote(id);
      if (result.success) {
        setNotes(notes.filter(n => n.id !== id));
      } else {
        throw new Error(result.error || 'Failed to delete note');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(
    note =>
      note.title_en.toLowerCase().includes(filter.toLowerCase()) ||
      note.chapter.subject.name_en.toLowerCase().includes(filter.toLowerCase())
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
              <h1 className="text-3xl font-bold text-white">Manage Notes</h1>
              <p className="text-gray-400 mt-1">Create and edit bilingual notes</p>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Note
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
        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search notes by title or subject..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Notes List */}
        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {notes.length === 0 ? 'No notes yet. Create one to get started.' : 'No notes match your search.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="border border-slate-700 bg-slate-800 rounded-lg p-4 hover:border-amber-600/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{note.title_en}</h3>
                    <p className="text-sm text-gray-400">{note.title_np}</p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>
                        Year {note.chapter.subject.year.year} • {note.chapter.subject.name_en}
                      </span>
                      <span>Chapter {note.chapter.order}: {note.chapter.title_en}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:border-red-900 hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {(isEditing || isCreating) && (
        <AdminNoteEditorWithChapterSelection
          isCreating={isCreating}
          initialData={selectedNote ? {
            title_en: selectedNote.title_en,
            title_np: selectedNote.title_np,
            content_en: selectedNote.content_en,
            content_np: selectedNote.content_np
          } : undefined}
          selectedChapter={selectedChapter}
          chapters={chapters}
          onChapterChange={setSelectedChapter}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setIsCreating(false);
            setSelectedNote(null);
            setSelectedChapter(null);
          }}
        />
      )}
    </div>
  );
}

function AdminNoteEditorWithChapterSelection({
  isCreating,
  initialData,
  selectedChapter,
  chapters,
  onChapterChange,
  onSave,
  onCancel
}: {
  isCreating: boolean;
  initialData?: {
    title_en: string;
    title_np: string;
    content_en: string;
    content_np: string;
  };
  selectedChapter: Chapter | null;
  chapters: Chapter[];
  onChapterChange: (chapter: Chapter | null) => void;
  onSave: (data: {
    title_en: string;
    title_np: string;
    content_en: string;
    content_np: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div>
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-sm">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-900">
              <h2 className="text-lg font-semibold text-white">Select Chapter</h2>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <p className="text-sm text-gray-400 mb-4">Choose chapter to add note to:</p>
              <div className="space-y-2">
                {chapters.length === 0 ? (
                  <p className="text-gray-500 text-sm">No chapters available. Create chapters first.</p>
                ) : (
                  chapters.map(chapter => (
                    <button
                      key={chapter.id}
                      onClick={() => onChapterChange(chapter)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        selectedChapter?.id === chapter.id
                          ? 'bg-amber-600/20 border-amber-600/50 text-amber-400 font-medium'
                          : 'border-slate-700 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="font-medium">Ch {chapter.order}: {chapter.title_en}</div>
                      <div className="text-xs text-gray-400 mt-1">{chapter.subject.name_en} - Year {chapter.subject.year.year}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedChapter && onCancel()}
                disabled={!selectedChapter}
                className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedChapter && (
        <AdminNoteEditor
          initialData={initialData}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
