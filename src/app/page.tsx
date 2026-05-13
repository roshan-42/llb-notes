import Link from "next/link";
import { BookOpen, BarChart3, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">LLBNOTES</h1>
          </div>
          {/* <Link
            href="/admin"
            className="text-sm px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white transition-colors"
          >
            Admin
          </Link> */}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Master Law. One Year at a Time.
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Comprehensive notes, exam questions, and study materials for Nepal's
          LLB curriculum.
        </p>
      </div>

      {/* Year Selection Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-semibold text-white mb-8">
          Select Your Year
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((year) => (
            <Link
              key={year}
              href={`/year/${year}`}
              className="group relative overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-800 p-8 hover:border-amber-600/50 transition-all hover:shadow-xl hover:shadow-amber-600/10"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-colors" />

              <div className="relative">
                <div className="text-6xl font-bold text-amber-600 mb-2">
                  {year}
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Year {year}
                </h4>
                <p className="text-gray-400 text-sm mb-6">
                  {year === 1 && "Foundation & Legal Theory"}
                  {year === 2 && "Core Law Subjects"}
                  {year === 3 && "Specialized & Practice"}
                </p>
                <div className="inline-flex items-center gap-2 text-amber-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">Explore</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-slate-700 py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <BookOpen className="w-8 h-8 text-amber-500 mb-4" />
              <h4 className="font-semibold text-white mb-2">
                Comprehensive Notes
              </h4>
              <p className="text-gray-400 text-sm">
                Bilingual notes covering every chapter and topic with detailed
                explanations.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <BarChart3 className="w-8 h-8 text-amber-500 mb-4" />
              <h4 className="font-semibold text-white mb-2">Exam Questions</h4>
              <p className="text-gray-400 text-sm">
                Past papers and possible questions organized by chapter with
                detailed answers.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800">
              <Users className="w-8 h-8 text-amber-500 mb-4" />
              <h4 className="font-semibold text-white mb-2">Dual Language</h4>
              <p className="text-gray-400 text-sm">
                Toggle between English and Nepali for complete comprehension and
                legal terminology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
