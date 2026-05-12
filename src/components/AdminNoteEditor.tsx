'use client';

import { useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';

interface AdminNoteEditorProps {
  noteId?: number;
  initialData?: {
    title_en: string;
    title_np: string;
    content_en: string;
    content_np: string;
  };
  onSave: (data: {
    title_en: string;
    title_np: string;
    content_en: string;
    content_np: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdminNoteEditor({
  initialData = {
    title_en: '',
    title_np: '',
    content_en: '',
    content_np: ''
  },
  onSave,
  onCancel,
  isLoading = false
}: AdminNoteEditorProps) {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof data, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!data.title_en.trim() || !data.title_np.trim()) {
      setError('Both English and Nepali titles are required');
      return;
    }
    if (!data.content_en.trim() || !data.content_np.trim()) {
      setError('Both English and Nepali content are required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">Edit Note</h2>
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
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* English Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h3 className="font-semibold text-white">English (EN)</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={data.title_en}
                  onChange={(e) => handleChange('title_en', e.target.value)}
                  disabled={isSaving}
                  placeholder="Enter English title..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={data.content_en}
                  onChange={(e) => handleChange('content_en', e.target.value)}
                  disabled={isSaving}
                  placeholder="Enter English content..."
                  rows={12}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
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
                  शीर्षक
                </label>
                <input
                  type="text"
                  value={data.title_np}
                  onChange={(e) => handleChange('title_np', e.target.value)}
                  disabled={isSaving}
                  placeholder="नेपाली शीर्षक प्रविष्ट गर्नुहोस्..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 text-lg leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  विषयवस्तु
                </label>
                <textarea
                  value={data.content_np}
                  onChange={(e) => handleChange('content_np', e.target.value)}
                  disabled={isSaving}
                  placeholder="नेपाली विषयवस्तु प्रविष्ट गर्नुहोस्..."
                  rows={12}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none disabled:opacity-50 text-lg leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900">
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
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
