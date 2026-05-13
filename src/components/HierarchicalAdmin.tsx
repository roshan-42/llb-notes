'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, ChevronDown, ChevronRight, AlertCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import AdminNoteBlockEditor from './AdminNoteBlockEditor';

interface Faculty {
  id: number;
  name: string;
  slug: string;
  years: Year[];
}

interface Year {
  id: number;
  year: number;
  name: string;
  facultyId: number;
  subjects: Subject[];
}

interface Subject {
  id: number;
  name_en: string;
  name_np: string;
  slug: string;
  yearId: number;
  chapters: Chapter[];
}

interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
  order: number;
  subjectId: number;
  notes: Note[];
  questions: Question[];
}

interface Note {
  id: number;
  title_en: string;
  title_np: string;
  content_en: string;
  chapterId: number;
}

interface Question {
  id: number;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
  chapterId: number;
}

type NavigationLevel = 'faculties' | 'years' | 'subjects' | 'chapters' | 'content';

export default function HierarchicalAdmin() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [contentType, setContentType] = useState<'notes' | 'exams'>('notes');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const res = await fetch('/api/admin/faculties');
      const data = await res.json();
      setFaculties(data);
      if (data.length > 0) {
        setSelectedFaculty(data[0]);
      }
    } catch (err) {
      setError('Failed to load faculties');
      console.error(err);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
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
                  setSelectedFaculty(faculty);
                  setSelectedYear(null);
                  setSelectedSubject(null);
                  setSelectedChapter(null);
                  toggleExpand(`faculty-${faculty.id}`);
                }}
                className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  selectedFaculty?.id === faculty.id
                    ? 'bg-amber-600/20 text-amber-400 font-semibold'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                {isExpanded(`faculty-${faculty.id}`) ? (
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
                          setSelectedYear(year);
                          setSelectedSubject(null);
                          setSelectedChapter(null);
                          toggleExpand(`year-${year.id}`);
                        }}
                        className={`w-full text-left px-4 py-1.5 rounded text-sm transition-colors flex items-center gap-2 ${
                          selectedYear?.id === year.id
                            ? 'bg-blue-600/20 text-blue-300'
                            : 'text-gray-400 hover:bg-slate-800'
                        }`}
                      >
                        {isExpanded(`year-${year.id}`) ? (
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
                                setSelectedSubject(subject);
                                setSelectedChapter(null);
                              }}
                              className={`w-full text-left px-3 py-1 rounded text-xs transition-colors block truncate ${
                                selectedSubject?.id === subject.id
                                  ? 'bg-purple-600/20 text-purple-300'
                                  : 'text-gray-500 hover:bg-slate-800'
                              }`}
                            >
                              {subject.name_en}
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
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedFaculty ? (
            <div className="text-center text-gray-400">Select faculty from left sidebar</div>
          ) : !selectedYear ? (
            <YearManager faculty={selectedFaculty} onYearSelect={setSelectedYear} />
          ) : !selectedSubject ? (
            <SubjectManager year={selectedYear} onSubjectSelect={setSelectedSubject} />
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
                <NoteEditor chapter={selectedChapter} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function YearManager({ faculty, onYearSelect }: { faculty: Faculty; onYearSelect: (year: Year) => void }) {
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
        window.location.reload();
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
                    fetch(`/api/admin/years/${year.id}`, { method: 'DELETE' }).then(() => window.location.reload());
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

function SubjectManager({ year, onSubjectSelect }: { year: Year; onSubjectSelect: (subject: Subject) => void }) {
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
        window.location.reload();
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
                    fetch(`/api/admin/subjects?id=${subject.id}`, { method: 'DELETE' }).then(() => window.location.reload());
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

function ChapterList({ subject, onChapterSelect }: { subject: Subject; onChapterSelect: (chapter: Chapter) => void }) {
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
        window.location.reload();
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
                    fetch(`/api/admin/chapters?id=${chapter.id}`, { method: 'DELETE' }).then(() => window.location.reload());
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

function NoteEditor({ chapter }: { chapter: Chapter }) {
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
      chapterId: chapter.id
    });
    setIsEditing(true);
  };

  const handleSaveNote = async (blocks: any[], title_en: string, title_np: string) => {
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
          content_en: JSON.stringify(blocks)
        })
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  if (isEditing && selectedNote) {
    return (
      <div className="flex flex-col h-full">
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedNote(null);
          }}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notes
        </button>
        <div className="flex-1 overflow-auto">
          <AdminNoteBlockEditor
            initialBlocks={selectedNote.content_en ? JSON.parse(selectedNote.content_en) : []}
            noteTitle_en={selectedNote.title_en}
            noteTitle_np={selectedNote.title_np}
            onSave={handleSaveNote}
            onCancel={() => {
              setIsEditing(false);
              setSelectedNote(null);
            }}
            isSaving={false}
          />
        </div>
      </div>
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
                    fetch(`/api/admin/notes/${note.id}`, { method: 'DELETE' }).then(() => window.location.reload());
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
