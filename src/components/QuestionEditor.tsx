'use client';

import { useState, useEffect } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface Question {
  id: number;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
  chapterId: number;
}

interface QuestionEditorProps {
  chapter: { id: number; title_en: string };
  question?: Question;
  onSave: (question: Partial<Question>) => Promise<void>;
  onCancel: () => void;
  onDelete?: (questionId: number) => Promise<void>;
}

export default function QuestionEditor({
  chapter,
  question,
  onSave,
  onCancel,
  onDelete
}: QuestionEditorProps) {
  const [questionEn, setQuestionEn] = useState(question?.question_en || '');
  const [questionNp, setQuestionNp] = useState(question?.question_np || '');
  const [answerEn, setAnswerEn] = useState(question?.answer_en || '');
  const [answerNp, setAnswerNp] = useState(question?.answer_np || '');
  const [type, setType] = useState<'past' | 'possible'>(question?.type || 'past');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuestionEn(question?.question_en || '');
    setQuestionNp(question?.question_np || '');
    setAnswerEn(question?.answer_en || '');
    setAnswerNp(question?.answer_np || '');
    setType(question?.type || 'past');
  }, [question]);

  const handleSave = async () => {
    if (!questionEn.trim() || !questionNp.trim() || !answerEn.trim() || !answerNp.trim()) {
      setError('All fields are required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...(question?.id && { id: question.id }),
        chapterId: chapter.id,
        question_en: questionEn,
        question_np: questionNp,
        answer_en: answerEn,
        answer_np: answerNp,
        type
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!question?.id || !confirm('Delete this question?')) return;

    setIsSaving(true);
    try {
      await onDelete?.(question.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">
            {question ? 'Edit Question' : 'New Question'} - {chapter.title_en}
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
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-900/20 border border-red-900/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-300px)] p-6 space-y-6">
          {/* Type Selector */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="past"
                checked={type === 'past'}
                onChange={(e) => setType(e.target.value as 'past' | 'possible')}
                disabled={isSaving}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Past Question</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="possible"
                checked={type === 'possible'}
                onChange={(e) => setType(e.target.value as 'past' | 'possible')}
                disabled={isSaving}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Possible Question</span>
            </label>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Question</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">English</label>
                <textarea
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  disabled={isSaving}
                  placeholder="Question in English"
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">नेपाली</label>
                <textarea
                  value={questionNp}
                  onChange={(e) => setQuestionNp(e.target.value)}
                  disabled={isSaving}
                  placeholder="प्रश्न नेपालीमा"
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 resize-none text-lg"
                />
              </div>
            </div>
          </div>

          {/* Answer */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Answer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">English Answer</label>
                <RichTextEditor
                  value={answerEn}
                  onChange={setAnswerEn}
                  placeholder="Write answer here. Paste from Google Docs or Word to preserve formatting."
                  disabled={isSaving}
                  minHeight={250}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">नेपाली उत्तर</label>
                <RichTextEditor
                  value={answerNp}
                  onChange={setAnswerNp}
                  placeholder="उत्तर यहाँ लेख्नुहोस्। Google Docs वा Word बाट पेस्ट गरेर फर्म्याटिङ सुरक्षित गर्नुहोस्।"
                  disabled={isSaving}
                  minHeight={250}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900">
          <div className="flex gap-2">
            {question && (
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:border-red-900 hover:bg-red-900/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
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
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
