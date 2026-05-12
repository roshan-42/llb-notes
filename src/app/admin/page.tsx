'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, BookOpen, Settings, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<[number, number, number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch data from multiple endpoints
        const [subjectsRes, chaptersRes, notesRes, questionsRes] = await Promise.all([
          fetch('/api/admin/subjects-count'),
          fetch('/api/admin/chapters-count'),
          fetch('/api/admin/notes-count'),
          fetch('/api/admin/questions-count')
        ]);

        const subjects = await subjectsRes.json();
        const chapters = await chaptersRes.json();
        const notes = await notesRes.json();
        const questions = await questionsRes.json();

        setStats([subjects.count, chapters.count, notes.count, questions.count]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats([0, 0, 0, 0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage subjects, chapters, notes, and exam questions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-white mb-8">Overview</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading stats...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
              <div className="text-3xl font-bold text-white">{stats?.[0] || 0}</div>
              <div className="text-sm text-gray-400 mt-1">Subjects</div>
            </div>
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
              <div className="text-3xl font-bold text-white">{stats?.[1] || 0}</div>
              <div className="text-sm text-gray-400 mt-1">Chapters</div>
            </div>
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <BookOpen className="w-8 h-8 text-green-400 mb-4" />
              <div className="text-3xl font-bold text-white">{stats?.[2] || 0}</div>
              <div className="text-sm text-gray-400 mt-1">Notes</div>
            </div>
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <Settings className="w-8 h-8 text-amber-400 mb-4" />
            <div className="text-3xl font-bold text-white">{stats?.[3] || 0}</div>
            <div className="text-sm text-gray-400 mt-1">Questions</div>
          </div>
        </div>
        )}

        {/* Action Cards */}
        <h2 className="text-2xl font-semibold text-white mb-8">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/subjects"
            className="p-8 rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-amber-600/50 transition-all hover:shadow-xl hover:shadow-amber-600/10 group"
          >
            <BookOpen className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
              Manage Subjects
            </h3>
            <p className="text-gray-400 text-sm mt-2">Create, edit, or delete subjects and chapters</p>
          </Link>

          <Link
            href="/admin/notes"
            className="p-8 rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-blue-600/50 transition-all hover:shadow-xl hover:shadow-blue-600/10 group"
          >
            <BookOpen className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              Manage Notes
            </h3>
            <p className="text-gray-400 text-sm mt-2">Edit bilingual notes with side-by-side editor</p>
          </Link>

          <Link
            href="/admin/questions"
            className="p-8 rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-purple-600/50 transition-all hover:shadow-xl hover:shadow-purple-600/10 group"
          >
            <BarChart3 className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              Manage Questions
            </h3>
            <p className="text-gray-400 text-sm mt-2">Add past and possible exam questions</p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-8 rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-green-600/50 transition-all hover:shadow-xl hover:shadow-green-600/10 group"
          >
            <Settings className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
              Settings
            </h3>
            <p className="text-gray-400 text-sm mt-2">Platform configuration and user management</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
