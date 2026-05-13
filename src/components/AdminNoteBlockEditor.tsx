'use client';

import { useState } from 'react';
import { Save, X, ArrowLeft } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface AdminNoteBlockEditorProps {
  initialContent_en?: string;
  initialContent_np?: string;
  noteTitle_en: string;
  noteTitle_np: string;
  onSave: (content_en: string, content_np: string, title_en: string, title_np: string) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function AdminNoteBlockEditor({
  initialContent_en = '',
  initialContent_np = '',
  noteTitle_en,
  noteTitle_np,
  onSave,
  onCancel,
  isSaving = false
}: AdminNoteBlockEditorProps) {
  const [content_en, setContent_en] = useState(initialContent_en);
  const [content_np, setContent_np] = useState(initialContent_np);
  const [title_en, setTitle_en] = useState(noteTitle_en);
  const [title_np, setTitle_np] = useState(noteTitle_np);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title_en.trim() || !title_np.trim()) {
      setError('Note title in both languages is required');
      return;
    }

    if (!content_en.trim() && !content_np.trim()) {
      setError('Content in at least one language is required');
      return;
    }

    setIsSavingLocal(true);
    try {
      await onSave(content_en, content_np, title_en, title_np);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSavingLocal(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onCancel}
        disabled={isSavingLocal || isSaving}
        className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Notes
      </button>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Title Section */}
        <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-white">Note Title</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">English</label>
              <input
                type="text"
                value={title_en}
                onChange={(e) => setTitle_en(e.target.value)}
                disabled={isSavingLocal || isSaving}
                placeholder="Note title in English"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">नेपाली</label>
              <input
                type="text"
                value={title_np}
                onChange={(e) => setTitle_np(e.target.value)}
                disabled={isSavingLocal || isSaving}
                placeholder="नोटको शीर्षक"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Content Editors */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">English Content</label>
            <RichTextEditor
              value={content_en}
              onChange={setContent_en}
              placeholder="Write your note here. Paste from Google Docs or Word to preserve formatting."
              disabled={isSavingLocal || isSaving}
              minHeight={300}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">नेपालीमा सामग्री</label>
            <RichTextEditor
              value={content_np}
              onChange={setContent_np}
              placeholder="नोट यहाँ लेख्नुहोस्। Google Docs वा Word बाट पेस्ट गरेर फर्म्याटिङ सुरक्षित गर्नुहोस्।"
              disabled={isSavingLocal || isSaving}
              minHeight={300}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700 mt-6">
        <button
          onClick={onCancel}
          disabled={isSavingLocal || isSaving}
          className="px-6 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSavingLocal || isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSavingLocal || isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
