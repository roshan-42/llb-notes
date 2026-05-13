'use client';

import { useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';

interface AdminSubjectEditorProps {
  initialData?: {
    id?: number;
    name_en: string;
    name_np: string;
    icon?: string;
  };
  yearId: number;
  onSave: (data: {
    id?: number;
    name_en: string;
    name_np: string;
    icon?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdminSubjectEditor({
  initialData = {
    name_en: '',
    name_np: '',
    icon: ''
  },
  yearId,
  onSave,
  onCancel,
  isLoading = false
}: AdminSubjectEditorProps) {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof data, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!data.name_en.trim() || !data.name_np.trim()) {
      setError('Both English and Nepali names are required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: data.id,
        name_en: data.name_en.trim(),
        name_np: data.name_np.trim(),
        icon: data.icon || undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving subject');
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
            {isEditing ? 'Edit Subject' : 'New Subject'}
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
                  Subject Name
                </label>
                <input
                  type="text"
                  value={data.name_en}
                  onChange={(e) => handleChange('name_en', e.target.value)}
                  disabled={isSaving}
                  placeholder="e.g., Constitutional Law"
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
                  विषयको नाम
                </label>
                <input
                  type="text"
                  value={data.name_np}
                  onChange={(e) => handleChange('name_np', e.target.value)}
                  disabled={isSaving}
                  placeholder="जस्तै, संवैधानिक कानून"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 text-lg leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icon (optional, Lucide icon name)
            </label>
            <input
              type="text"
              value={data.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              disabled={isSaving}
              placeholder="e.g., BookOpen, scales, etc."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-1">
              Find icons at lucide.dev
            </p>
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
            {isSaving ? 'Saving...' : 'Save Subject'}
          </button>
        </div>
      </div>
    </div>
  );
}
