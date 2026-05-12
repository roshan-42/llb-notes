import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function YearPage({
  params
}: {
  params: { year: string };
}) {
  const yearNum = parseInt(params.year);

  if (isNaN(yearNum) || yearNum < 1 || yearNum > 3) {
    notFound();
  }

  const year = await prisma.year.findUnique({
    where: { year: yearNum },
    include: {
      subjects: {
        orderBy: { slug: 'asc' }
      }
    }
  });

  if (!year) {
    notFound();
  }

  const yearDescriptions: Record<number, string> = {
    1: 'Foundation & Legal Theory',
    2: 'Core Law Subjects',
    3: 'Specialized & Practice'
  };

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
          <h1 className="text-3xl font-bold text-white">Year {yearNum}</h1>
          <p className="text-gray-400 mt-1">{yearDescriptions[yearNum]}</p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-white mb-8">Subjects</h2>

        {year.subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookMarked className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No subjects available for Year {yearNum}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {year.subjects.map(subject => (
              <Link
                key={subject.id}
                href={`/year/${yearNum}/subject/${subject.slug}`}
                className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 hover:border-amber-600/50 transition-all hover:shadow-xl hover:shadow-amber-600/10"
              >
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-colors" />

                <div className="relative">
                  {subject.icon && (
                    <div className="text-3xl mb-3">{subject.icon}</div>
                  )}
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {subject.name_en}
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">{subject.name_np}</p>
                  <div className="inline-flex items-center gap-2 text-amber-400 mt-4 group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">View</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ year: '1' }, { year: '2' }, { year: '3' }];
}
