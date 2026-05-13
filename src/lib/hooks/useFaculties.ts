import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface Note {
  id: number;
  title_en: string;
  title_np: string;
  chapterId: number;
  order: number;
  content_en?: string;
  content_np?: string;
}

export interface Question {
  id: number;
  question_en: string;
  question_np: string;
  type: 'past' | 'possible';
  chapterId: number;
  answer_en?: string;
  answer_np?: string;
}

export interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
  order: number;
  subjectId: number;
  notes: Note[];
  questions: Question[];
}

export interface Subject {
  id: number;
  name_en: string;
  name_np: string;
  slug: string;
  yearId: number;
  chapters: Chapter[];
}

export interface Year {
  id: number;
  year: number;
  name: string;
  facultyId: number;
  subjects: Subject[];
}

export interface Faculty {
  id: number;
  name: string;
  slug: string;
  years: Year[];
}

export function useFaculties() {
  return useQuery({
    queryKey: ['faculties'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Faculty[]>('/api/admin/faculties');
      return data;
    },
  });
}
