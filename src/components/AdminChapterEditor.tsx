'use client';

import { useState } from 'react';
import { Save, X, AlertCircle, Trash2 } from 'lucide-react';

interface AdminChapterEditorProps {
  initialData?: {
    id?: number;
    title_en: string;
    title_np: string;
    order: number;
  };
  subjectId: number;
  existingChapters: Array<{ id: number; order: number; title_en: string; title_np: string }>;
  onSave: (data: {
    id?: number;
    title_en: string;
    title_np: string;
    order: number;
  }) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdminChapterEditor({
  initialData,
  subjectId,
  existingChapters,
  onSave,
  onDelete,
  onCancel,
  isLoading = false
}: AdminChapterEditorProps) {
  const [data, setData] = useState(initialData || {
    title_en: '',
    title_np: '',
    order: (existingChapters.length || 0) + 1
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof data, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!data.title_en.trim() || !data.title_np.trim()) {
      setError('Both English and Nepali titles are required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: data.id,
        title_en: data.title_en.trim(),
        title_np: data.title_np.trim(),
        order: data.order as number
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving chapter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data.id || !onDelete) return;
    if (!confirm('Delete this chapter and all its notes?')) return;

    setIsSaving(true);
    try {
      await onDelete(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting chapter');
    } finally {
      setIsSaving(false);
    }
  };

  const isEditing = !!data.id;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Chapter' : 'New Chapter'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-900/20 border border-red-900/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* English Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-semibold text-white">English (EN)</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chapter Title
                </label>
                <input
                  type="text"
                  value={data.title_en}
                  onChange={(e) => handleChange('title_en', e.target.value)}
                  disabled={isSaving}
                  placeholder="e.g., Introduction to Constitutional Law"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Nepali Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <h3 className="font-semibold text-white">नेपाली (NP)</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  अध्यायको नाम
                </label>
                <input
                  type="text"
                  value={data.title_np}
                  onChange={(e) => handleChange('title_np', e.target.value)}
                  disabled={isSaving}
                  placeholder="जस्तै, संवैधानिक कानूनको परिचय"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 text-lg leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chapter Order
            </label>
            <input
              type="number"
              value={data.order}
              onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
              disabled={isSaving}
              min="1"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900">
          <div>
            {isEditing && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:border-red-900 hover:bg-red-900/10 font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Chapter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
