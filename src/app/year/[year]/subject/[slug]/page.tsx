import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function SubjectHubPage({
  params
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;
  const yearNum = parseInt(year);

  if (isNaN(yearNum) || yearNum < 1 || yearNum > 3) {
    notFound();
  }

  const subject = await prisma.subject.findFirst({
    where: {
      slug,
      year: { year: yearNum }
    },
    include: {
      chapters: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href={`/year/${yearNum}`}
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Year {yearNum}
          </Link>
          <h1 className="text-3xl font-bold text-white">{subject.name_en}</h1>
          <p className="text-gray-400 mt-1">{subject.name_np}</p>
        </div>
      </div>

      {/* Subject Hub - Two Options */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-white mb-8">Study Materials</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notes Section */}
          <Link
            href={`/year/${yearNum}/subject/${slug}/notes`}
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 hover:border-blue-600/50 transition-all hover:shadow-xl hover:shadow-blue-600/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors" />

            <div className="relative">
              <BookOpen className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Study Notes</h3>
              <p className="text-gray-400 mb-6">
                Comprehensive chapter-wise notes with detailed explanations and legal terminology.
              </p>
              <div className="text-sm text-blue-400 font-medium">
                {subject.chapters.length} chapters
              </div>
              <div className="inline-flex items-center gap-2 text-blue-400 mt-6 group-hover:gap-3 transition-all">
                <span className="font-medium">Start Reading</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Exams Section */}
          <Link
            href={`/year/${yearNum}/subject/${slug}/exams`}
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 hover:border-purple-600/50 transition-all hover:shadow-xl hover:shadow-purple-600/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors" />

            <div className="relative">
              <FileText className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Exam Questions</h3>
              <p className="text-gray-400 mb-6">
                Past papers and possible questions organized by chapter with detailed answers.
              </p>
              <div className="text-sm text-purple-400 font-medium">
                {subject.chapters.length} chapters
              </div>
              <div className="inline-flex items-center gap-2 text-purple-400 mt-6 group-hover:gap-3 transition-all">
                <span className="font-medium">Practice Now</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Chapters Overview */}
      <div className="border-t border-slate-700 bg-slate-900/30 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-xl font-semibold text-white mb-6">Chapters</h3>
          <div className="space-y-2">
            {subject.chapters.map(chapter => (
              <div
                key={chapter.id}
                className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/50 text-gray-300 flex justify-between items-center"
              >
                <span>
                  <span className="font-semibold text-slate-400">Chapter {chapter.order}:</span> {chapter.title_en}
                </span>
                <span className="text-xs text-gray-500">{chapter.title_np}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
