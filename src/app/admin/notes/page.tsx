'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import AdminNoteEditor from '@/components/AdminNoteEditor';
import { updateNote, deleteNote } from '@/lib/actions';

interface Note {
  id: number;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  chapter: {
    id: number;
    title_en: string;
    order: number;
    subject: {
      name_en: string;
      year: {
        year: number;
      };
    };
  };
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/admin/notes');
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleSave = async (data: {
    title_en: string;
    title_np: string;
    content_en: string;
    content_np: string;
  }) => {
    if (!selectedNote) return;

    const result = await updateNote(selectedNote.id, data);
    if (result.success) {
      setNotes(notes.map(n => (n.id === selectedNote.id ? { ...n, ...data } : n)));
      setIsEditing(false);
      setSelectedNote(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this note?')) return;

    const result = await deleteNote(id);
    if (result.success) {
      setNotes(notes.filter(n => n.id !== id));
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
              <p className="text-gray-400 mt-1">Edit bilingual notes with side-by-side editor</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        </div>
      </div>

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

        {/* Notes Table */}
        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
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
                      <span>Chapter {note.chapter.order}</span>
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
      {isEditing && selectedNote && (
        <AdminNoteEditor
          initialData={{
            title_en: selectedNote.title_en,
            title_np: selectedNote.title_np,
            content_en: selectedNote.content_en,
            content_np: selectedNote.content_np
          }}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setSelectedNote(null);
          }}
        />
      )}
    </div>
  );
}
