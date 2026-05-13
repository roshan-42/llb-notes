import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface NoteDetail {
  id: number;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np?: string;
  chapterId: number;
  order: number;
}

export function useNote(noteId?: number) {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<NoteDetail>(
        `/api/admin/notes/${noteId}`
      );
      return data;
    },
    enabled: !!noteId && noteId !== 0,
  });
}
