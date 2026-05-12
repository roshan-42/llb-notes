'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { deleteQuestion } from '@/lib/actions';

interface Question {
  id: number;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/admin/questions');
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this question?')) return;

    const result = await deleteQuestion(id);
    if (result.success) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesType = filter === 'all' || q.type === filter;
    const matchesSearch =
      q.question_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.chapter.subject.name_en.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

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
              <h1 className="text-3xl font-bold text-white">Manage Questions</h1>
              <p className="text-gray-400 mt-1">Add and edit past and possible exam questions</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New Question
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            {['all', 'past', 'possible'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                  filter === type
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'border-slate-700 text-gray-300 hover:border-slate-600'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map(question => (
              <div
                key={question.id}
                className="border border-slate-700 bg-slate-800 rounded-lg p-6 hover:border-amber-600/50 transition-colors"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          question.type === 'past'
                            ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                            : 'bg-slate-600/50 text-slate-300 border border-slate-600'
                        }`}
                      >
                        {question.type === 'past' ? 'Past Question' : 'Possible'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Year {question.chapter.subject.year.year} • {question.chapter.subject.name_en}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{question.question_en}</h3>
                    <p className="text-sm text-gray-400">{question.question_np}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:text-white hover:border-slate-500 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:border-red-900 hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <details className="text-sm text-gray-300">
                  <summary className="cursor-pointer font-medium hover:text-white">
                    View Answer
                  </summary>
                  <div className="mt-3 px-4 py-2 rounded bg-slate-900/50 border border-slate-700">
                    <p className="mb-2 font-semibold text-white">English:</p>
                    <p className="mb-3">{question.answer_en}</p>
                    <p className="mb-2 font-semibold text-white">नेपाली:</p>
                    <p>{question.answer_np}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
