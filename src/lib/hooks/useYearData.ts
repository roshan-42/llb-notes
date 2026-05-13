import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

interface Subject {
  id: number;
  name_en: string;
  name_np: string;
  slug: string;
  icon?: string;
}

interface YearData {
  subjects: Subject[];
}

export function useYearData(year: number) {
  return useQuery({
    queryKey: ['year', year],
    queryFn: async () => {
      const { data } = await axiosInstance.get<YearData>(`/api/years/${year}`);
      return data;
    },
    enabled: !!year,
  });
}
