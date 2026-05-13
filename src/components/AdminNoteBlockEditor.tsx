'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';

export interface NoteBlock {
  id: string;
  type: 'heading' | 'subheading' | 'body' | 'image';
  content_en: string;
  content_np: string;
}

interface AdminNoteBlockEditorProps {
  initialBlocks?: NoteBlock[];
  noteTitle_en: string;
  noteTitle_np: string;
  onSave: (blocks: NoteBlock[], title_en: string, title_np: string) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function AdminNoteBlockEditor({
  initialBlocks = [],
  noteTitle_en,
  noteTitle_np,
  onSave,
  onCancel,
  isSaving = false
}: AdminNoteBlockEditorProps) {
  const [blocks, setBlocks] = useState<NoteBlock[]>(initialBlocks);
  const [title_en, setTitle_en] = useState(noteTitle_en);
  const [title_np, setTitle_np] = useState(noteTitle_np);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBlock = (type: NoteBlock['type']) => {
    const newBlock: NoteBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content_en: '',
      content_np: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, field: 'content_en' | 'content_np', value: string) => {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, [field]: value } : b)));
    setError(null);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    if (!title_en.trim() || !title_np.trim()) {
      setError('Note title in both languages is required');
      return;
    }

    const emptyBlocks = blocks.filter(b => !b.content_en.trim() && !b.content_np.trim());
    if (emptyBlocks.length > 0) {
      setError('All blocks must have content in at least one language');
      return;
    }

    setIsSavingLocal(true);
    try {
      await onSave(blocks, title_en, title_np);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSavingLocal(false);
    }
  };

  const blockLabels = {
    heading: 'Heading',
    subheading: 'Sub-heading',
    body: 'Body',
    image: 'Image'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900 sticky top-0">
          <h2 className="text-xl font-semibold text-white">Edit Note</h2>
          <button
            onClick={onCancel}
            disabled={isSavingLocal || isSaving}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-900/20 border border-red-900/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-300px)] p-6 space-y-6">
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

          {/* Blocks */}
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-600 rounded-lg">
                <p className="text-gray-400">No blocks yet. Add your first block below.</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="border border-slate-600 bg-slate-700/50 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-400">{blockLabels[block.type]}</span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0 || isSavingLocal || isSaving}
                        className="p-1 hover:bg-slate-600 rounded disabled:opacity-50"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1 || isSavingLocal || isSaving}
                        className="p-1 hover:bg-slate-600 rounded disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        disabled={isSavingLocal || isSaving}
                        className="p-1 hover:bg-red-900/30 rounded disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {block.type === 'image' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (EN)</label>
                        <input
                          type="url"
                          value={block.content_en}
                          onChange={(e) => updateBlock(block.id, 'content_en', e.target.value)}
                          disabled={isSavingLocal || isSaving}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (NP)</label>
                        <input
                          type="url"
                          value={block.content_np}
                          onChange={(e) => updateBlock(block.id, 'content_np', e.target.value)}
                          disabled={isSavingLocal || isSaving}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">English</label>
                        <textarea
                          value={block.content_en}
                          onChange={(e) => updateBlock(block.id, 'content_en', e.target.value)}
                          disabled={isSavingLocal || isSaving}
                          placeholder={`Enter ${blockLabels[block.type].toLowerCase()} in English`}
                          rows={block.type === 'heading' ? 2 : block.type === 'subheading' ? 2 : 6}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">नेपाली</label>
                        <textarea
                          value={block.content_np}
                          onChange={(e) => updateBlock(block.id, 'content_np', e.target.value)}
                          disabled={isSavingLocal || isSaving}
                          placeholder={`${blockLabels[block.type]} नेपालीमा प्रविष्ट गर्नुहोस्`}
                          rows={block.type === 'heading' ? 2 : block.type === 'subheading' ? 2 : 6}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 resize-none text-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Block Buttons */}
          <div className="flex flex-wrap gap-2 p-4 bg-slate-700/30 rounded-lg">
            <button
              onClick={() => addBlock('heading')}
              disabled={isSavingLocal || isSaving}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Heading
            </button>
            <button
              onClick={() => addBlock('subheading')}
              disabled={isSavingLocal || isSaving}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Sub-heading
            </button>
            <button
              onClick={() => addBlock('body')}
              disabled={isSavingLocal || isSaving}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Body
            </button>
            <button
              onClick={() => addBlock('image')}
              disabled={isSavingLocal || isSaving}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Image
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900 sticky bottom-0">
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
    </div>
  );
}
