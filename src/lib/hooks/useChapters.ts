import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface Note {
  id: number;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
}

export interface Question {
  id: number;
  question_en: string;
  question_np: string;
  answer_en: string;
  answer_np: string;
  type: 'past' | 'possible';
}

export interface Chapter {
  id: number;
  title_en: string;
  title_np: string;
  order: number;
  notes: Note[];
  questions: Question[];
}

export function useChapters(slug: string) {
  return useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Chapter[]>(
        `/api/subjects/${slug}/chapters`
      );
      return data;
    },
    enabled: !!slug,
  });
}
