'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, ChevronDown, ChevronRight, AlertCircle, BookOpen, Loader } from 'lucide-react';
import Link from 'next/link';
import AdminNoteBlockEditor from './AdminNoteBlockEditor';
import QuestionEditor from './QuestionEditor';
import { useFaculties, type Faculty, type Year, type Subject, type Chapter, type Note, type Question } from '@/lib/hooks/useFaculties';
import { useQueryClient } from '@tanstack/react-query';

type NavigationLevel = 'faculties' | 'years' | 'subjects' | 'chapters' | 'content';

export default function HierarchicalAdmin() {
  const queryClient = useQueryClient();
  const { data: faculties = [], isLoading, error: fetchError } = useFaculties();
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [contentType, setContentType] = useState<'notes' | 'exams'>('notes');
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (faculties.length > 0 && !selectedFaculty) {
      setSelectedFaculty(faculties[0]);
    }
  }, [faculties, selectedFaculty]);

  const refetchAndMaintainState = async () => {
    await queryClient.invalidateQueries({ queryKey: ['faculties'] });

    const data = queryClient.getQueryData<Faculty[]>(['faculties']) || faculties;

    // Try to keep current selections if they still exist
    if (selectedFaculty) {
      const foundFaculty = data.find((f: Faculty) => f.id === selectedFaculty.id);
      if (foundFaculty) {
        setSelectedFaculty(foundFaculty);

        // Try to keep selected year
        if (selectedYear) {
          const foundYear = foundFaculty.years.find((y: Year) => y.id === selectedYear.id);
          if (foundYear) {
            setSelectedYear(foundYear);

            // Try to keep selected subject
            if (selectedSubject) {
              const foundSubject = foundYear.subjects.find((s: Subject) => s.id === selectedSubject.id);
              setSelectedSubject(foundSubject || null);
            }
          } else {
            setSelectedYear(null);
            setSelectedSubject(null);
          }
        }
      } else {
        setSelectedFaculty(data.length > 0 ? data[0] : null);
        setSelectedYear(null);
        setSelectedSubject(null);
        setSelectedChapter(null);
      }
    }
  };

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isExpanded = (nodeId: string) => expandedNodes.has(nodeId);

  if (isLoading || faculties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error loading faculties</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar - Navigation */}
      <aside className="w-96 border-r border-slate-700 bg-slate-900 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-900">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-lg font-bold text-white">LLB Admin</h1>
        </div>

        {/* Faculties */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          {faculties.map(faculty => (
            <div key={faculty.id}>
              <button
                onClick={() => {
                  if (isTransitioning) return;
                  setIsTransitioning(true);
                  setSelectedFaculty(faculty);
                  setSelectedYear(null);
                  setSelectedSubject(null);
                  setSelectedChapter(null);
                  toggleExpand(`faculty-${faculty.id}`);
                  setTimeout(() => setIsTransitioning(false), 500);
                }}
                disabled={isTransitioning}
                className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  selectedFaculty?.id === faculty.id
                    ? 'bg-amber-600/20 text-amber-400 font-semibold'
                    : 'text-gray-300 hover:bg-slate-800'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isTransitioning && selectedFaculty?.id === faculty.id ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : isExpanded(`faculty-${faculty.id}`) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <BookOpen className="w-4 h-4" />
                {faculty.name}
              </button>

              {isExpanded(`faculty-${faculty.id}`) && (
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-0">
                  {faculty.years.map(year => (
                    <div key={year.id}>
                      <button
                        onClick={() => {
                          if (isTransitioning) return;
                          setIsTransitioning(true);
                          setSelectedYear(year);
                          setSelectedSubject(null);
                          setSelectedChapter(null);
                          toggleExpand(`year-${year.id}`);
                          setTimeout(() => setIsTransitioning(false), 500);
                        }}
                        disabled={isTransitioning}
                        className={`w-full text-left px-4 py-1.5 rounded text-sm transition-colors flex items-center gap-2 ${
                          selectedYear?.id === year.id
                            ? 'bg-blue-600/20 text-blue-300'
                            : 'text-gray-400 hover:bg-slate-800'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        {isTransitioning && selectedYear?.id === year.id ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : isExpanded(`year-${year.id}`) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        Year {year.year}
                      </button>

                      {isExpanded(`year-${year.id}`) && (
                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-700 pl-0">
                          {year.subjects.map(subject => (
                            <button
                              key={subject.id}
                              onClick={() => {
                                if (isTransitioning) return;
                                setIsTransitioning(true);
                                setSelectedSubject(subject);
                                setSelectedChapter(null);
                                setTimeout(() => setIsTransitioning(false), 500);
                              }}
                              disabled={isTransitioning}
                              className={`w-full text-left px-3 py-1 rounded text-xs transition-colors block truncate flex items-center gap-1 ${
                                selectedSubject?.id === subject.id
                                  ? 'bg-purple-600/20 text-purple-300'
                                  : 'text-gray-500 hover:bg-slate-800'
                              } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                              {isTransitioning && selectedSubject?.id === subject.id && (
                                <Loader className="w-3 h-3 animate-spin flex-shrink-0" />
                              )}
                              <span className="truncate">{subject.name_en}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="border-b border-slate-700 bg-slate-900/50 p-4">
          {selectedFaculty ? (
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="text-amber-400 font-semibold">{selectedFaculty.name}</span>
              {selectedYear && (
                <>
                  <span>→</span>
                  <span className="text-blue-400 font-semibold">Year {selectedYear.year}</span>
                </>
              )}
              {selectedSubject && (
                <>
                  <span>→</span>
                  <span className="text-purple-400 font-semibold">{selectedSubject.name_en}</span>
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Select a faculty to begin</div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {!selectedFaculty ? (
            <div className="text-center text-gray-400">Select faculty from left sidebar</div>
          ) : !selectedYear ? (
            <YearManager faculty={selectedFaculty} onYearSelect={setSelectedYear} onRefresh={refetchAndMaintainState} />
          ) : !selectedSubject ? (
            <SubjectManager year={selectedYear} onSubjectSelect={setSelectedSubject} onRefresh={refetchAndMaintainState} />
          ) : !selectedChapter ? (
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-slate-700 pb-4">
                <button
                  onClick={() => setContentType('notes')}
                  className={`px-4 py-2 rounded-t font-medium transition-colors ${
                    contentType === 'notes'
                      ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setContentType('exams')}
                  className={`px-4 py-2 rounded-t font-medium transition-colors ${
                    contentType === 'exams'
                      ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Exams
                </button>
              </div>

              {contentType === 'notes' && (
                <ChapterList
                  subject={selectedSubject}
                  onChapterSelect={setSelectedChapter}
                  onRefresh={refetchAndMaintainState}
                />
              )}

              {contentType === 'exams' && (
                <ExamManager
                  subject={selectedSubject}
                  onChapterSelect={setSelectedChapter}
                  onRefresh={refetchAndMaintainState}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedChapter(null)}
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Chapters
              </button>

              {contentType === 'notes' && selectedChapter && (
                <NoteEditor chapter={selectedChapter} onRefresh={refetchAndMaintainState} />
              )}

              {contentType === 'exams' && selectedChapter && (
                <QuestionsList chapter={selectedChapter} onRefresh={refetchAndMaintainState} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function YearManager({ faculty, onYearSelect, onRefresh }: { faculty: Faculty; onYearSelect: (year: Year) => void; onRefresh: () => Promise<void> }) {
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearNumber, setNewYearNumber] = useState(1);
  const [newYearName, setNewYearName] = useState('');

  const handleAddYear = async () => {
    try {
      const res = await fetch('/api/admin/years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: faculty.id,
          year: newYearNumber,
          name: newYearName || `Year ${newYearNumber}`
        })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error adding year:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Years in {faculty.name}</h2>
        <button
          onClick={() => setIsAddingYear(!isAddingYear)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Year
        </button>
      </div>

      {isAddingYear && (
        <div className="p-4 rounded-lg border border-slate-700 bg-slate-800 space-y-3">
          <input
            type="number"
            placeholder="Year number (1, 2, 3...)"
            value={newYearNumber}
            onChange={(e) => setNewYearNumber(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-amber-600"
          />
          <input
            type="text"
            placeholder="Year name (optional)"
            value={newYearName}
            onChange={(e) => setNewYearName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-amber-600"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddYear}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsAddingYear(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {faculty.years.map(year => (
          <div key={year.id} className="relative group">
            <button
              onClick={() => onYearSelect(year)}
              className="w-full p-6 rounded-lg border border-slate-700 bg-slate-800 hover:border-amber-600/50 transition-colors text-center"
            >
              <div className="text-3xl font-bold text-amber-400">Year {year.year}</div>
              <div className="text-sm text-gray-400 mt-2">{year.subjects.length} subjects</div>
            </button>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Edit year - TODO
                }}
                className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete Year ${year.year}?`)) {
                    fetch(`/api/admin/years/${year.id}`, { method: 'DELETE' }).then(() => onRefresh());
                  }
                }}
                className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectManager({ year, onSubjectSelect, onRefresh }: { year: Year; onSubjectSelect: (subject: Subject) => void; onRefresh: () => Promise<void> }) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectEn, setNewSubjectEn] = useState('');
  const [newSubjectNp, setNewSubjectNp] = useState('');

  const handleAddSubject = async () => {
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearId: year.id,
          name_en: newSubjectEn,
          name_np: newSubjectNp
        })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error adding subject:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Subjects - Year {year.year}</h2>
        <button
          onClick={() => setIsAddingSubject(!isAddingSubject)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {isAddingSubject && (
        <div className="p-4 rounded-lg border border-slate-700 bg-slate-800 space-y-3">
          <input
            type="text"
            placeholder="Subject name (English)"
            value={newSubjectEn}
            onChange={(e) => setNewSubjectEn(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-600"
          />
          <input
            type="text"
            placeholder="Subject name (Nepali)"
            value={newSubjectNp}
            onChange={(e) => setNewSubjectNp(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-600"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddSubject}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsAddingSubject(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {year.subjects.map(subject => (
          <div key={subject.id} className="relative group">
            <button
              onClick={() => onSubjectSelect(subject)}
              className="w-full p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-600/50 transition-colors text-left"
            >
              <div className="font-semibold text-white">{subject.name_en}</div>
              <div className="text-sm text-gray-400">{subject.name_np}</div>
              <div className="text-xs text-gray-500 mt-1">{subject.chapters.length} chapters</div>
            </button>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Edit subject - TODO
                }}
                className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${subject.name_en}?`)) {
                    fetch(`/api/admin/subjects?id=${subject.id}`, { method: 'DELETE' }).then(() => onRefresh());
                  }
                }}
                className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterList({ subject, onChapterSelect, onRefresh }: { subject: Subject; onChapterSelect: (chapter: Chapter) => void; onRefresh: () => Promise<void> }) {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterEn, setNewChapterEn] = useState('');
  const [newChapterNp, setNewChapterNp] = useState('');

  const handleAddChapter = async () => {
    try {
      const maxOrder = subject.chapters.length > 0
        ? Math.max(...subject.chapters.map(c => c.order))
        : 0;

      const res = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject.id,
          title_en: newChapterEn,
          title_np: newChapterNp,
          order: maxOrder + 1
        })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error adding chapter:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white text-lg">Chapters</h3>
        <button
          onClick={() => setIsAddingChapter(!isAddingChapter)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {isAddingChapter && (
        <div className="p-3 rounded-lg border border-slate-700 bg-slate-800 space-y-2">
          <input
            type="text"
            placeholder="Chapter title (English)"
            value={newChapterEn}
            onChange={(e) => setNewChapterEn(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-600"
          />
          <input
            type="text"
            placeholder="Chapter title (Nepali)"
            value={newChapterNp}
            onChange={(e) => setNewChapterNp(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-600"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddChapter}
              className="flex-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsAddingChapter(false)}
              className="flex-1 px-3 py-1.5 rounded border border-slate-600 text-gray-300 hover:bg-slate-700 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {subject.chapters.map(chapter => (
          <div key={chapter.id} className="relative group">
            <button
              onClick={() => onChapterSelect(chapter)}
              className="w-full p-3 rounded border border-slate-700 bg-slate-800 hover:border-blue-600/50 transition-colors text-left text-sm"
            >
              <div className="font-medium text-white">Ch {chapter.order}: {chapter.title_en}</div>
              <div className="text-xs text-gray-400">{chapter.notes.length} notes • {chapter.questions.length} questions</div>
            </button>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Edit chapter - TODO
                }}
                className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete Chapter ${chapter.order}: ${chapter.title_en}?`)) {
                    fetch(`/api/admin/chapters?id=${chapter.id}`, { method: 'DELETE' }).then(() => onRefresh());
                  }
                }}
                className="p-1 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteEditor({ chapter, onRefresh }: { chapter: Chapter; onRefresh: () => Promise<void> }) {
  const [notes, setNotes] = useState<Note[]>(chapter.notes || []);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddNote = () => {
    setSelectedNote({
      id: 0,
      title_en: '',
      title_np: '',
      content_en: '',
      chapterId: chapter.id,
      order: (chapter.notes?.length || 0) + 1
    });
    setIsEditing(true);
  };

  const handleSaveNote = async (content_en: string, content_np: string, title_en: string, title_np: string) => {
    try {
      const method = selectedNote!.id === 0 ? 'POST' : 'PUT';
      const endpoint = '/api/admin/notes';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(selectedNote!.id !== 0 && { id: selectedNote!.id }),
          ...(selectedNote!.id === 0 && { chapterId: chapter.id }),
          title_en,
          title_np,
          content_en,
          content_np
        })
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  if (isEditing && selectedNote) {
    return (
      <AdminNoteBlockEditor
        initialContent_en={selectedNote.content_en || ''}
        initialContent_np={selectedNote.content_np || ''}
        noteTitle_en={selectedNote.title_en}
        noteTitle_np={selectedNote.title_np}
        onSave={handleSaveNote}
        onCancel={() => {
          setIsEditing(false);
          setSelectedNote(null);
        }}
        isSaving={false}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">{chapter.title_en}</h3>
        <button
          onClick={handleAddNote}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="text-gray-400 text-sm">{notes.length} notes in this chapter</div>
      <div className="space-y-2">
        {notes.map(note => (
          <div
            key={note.id}
            className="relative group p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-amber-600/50 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedNote(note);
              setIsEditing(true);
            }}
          >
            <div className="font-semibold text-white">{note.title_en}</div>
            <div className="text-sm text-gray-400">{note.title_np}</div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete note "${note.title_en}"?`)) {
                    fetch(`/api/admin/notes/${note.id}`, { method: 'DELETE' }).then(() => onRefresh());
                  }
                }}
                className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamManager({ subject, onChapterSelect, onRefresh }: { subject: Subject; onChapterSelect: (chapter: Chapter) => void; onRefresh: () => Promise<void> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Chapters - {subject.name_en}</h2>
      <div className="space-y-2">
        {subject.chapters.map(chapter => (
          <div key={chapter.id} className="relative group">
            <button
              onClick={() => onChapterSelect(chapter)}
              className="w-full p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-600/50 transition-colors text-left"
            >
              <div className="font-semibold text-white">Ch {chapter.order}: {chapter.title_en}</div>
              <div className="text-sm text-gray-400">{chapter.title_np}</div>
              <div className="text-xs text-gray-500 mt-1">
                {chapter.questions.filter(q => q.type === 'past').length} past • {chapter.questions.filter(q => q.type === 'possible').length} possible
              </div>
            </button>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete Chapter ${chapter.order}: ${chapter.title_en}?`)) {
                    fetch(`/api/admin/chapters?id=${chapter.id}`, { method: 'DELETE' }).then(() => onRefresh());
                  }
                }}
                className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsList({ chapter, onRefresh }: { chapter: Chapter; onRefresh: () => Promise<void> }) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'past' | 'possible'>('all');

  const filteredQuestions = (chapter.questions || []).filter(q =>
    filterType === 'all' ? true : q.type === filterType
  );

  const handleAddQuestion = () => {
    setSelectedQuestion({
      id: 0,
      question_en: '',
      question_np: '',
      answer_en: '',
      answer_np: '',
      type: 'past',
      chapterId: chapter.id
    });
    setIsEditing(true);
  };

  const handleSaveQuestion = async (questionData: Partial<Question>) => {
    try {
      const method = selectedQuestion?.id === 0 ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error saving question:', err);
      throw err;
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      throw err;
    }
  };

  if (isEditing && selectedQuestion) {
    return (
      <>
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedQuestion(null);
          }}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </button>
        <QuestionEditor
          chapter={chapter}
          question={selectedQuestion.id === 0 ? undefined : (selectedQuestion as any)}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setIsEditing(false);
            setSelectedQuestion(null);
          }}
          onDelete={handleDeleteQuestion}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">{chapter.title_en}</h3>
        <button
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Question
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'past', 'possible'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type as 'all' | 'past' | 'possible')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filterType === type
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {type === 'all' ? 'All' : type === 'past' ? 'Past' : 'Possible'}
          </button>
        ))}
      </div>

      <div className="text-gray-400 text-sm">
        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-2">
        {filteredQuestions.map(question => (
          <div
            key={question.id}
            className="relative group p-4 rounded-lg border border-slate-700 bg-slate-800 hover:border-purple-600/50 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedQuestion(question);
              setIsEditing(true);
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-purple-400 mb-1">
                  {question.type === 'past' ? 'Past Question' : 'Possible Question'}
                </div>
                <div className="font-semibold text-white truncate">{question.question_en}</div>
                <div className="text-sm text-gray-400 line-clamp-2">{question.answer_en}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this question?')) {
                    handleDeleteQuestion(question.id);
                  }
                }}
                className="p-1.5 rounded bg-red-600 hover:bg-red-500 text-white flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
