import { useQuery } from "@tanstack/react-query";
import { fetchCrowd } from "@/libs/api/crowd";

export function useCrowd() {
  return useQuery({
    queryKey: ["crowd"],
    queryFn: fetchCrowd,
    staleTime: 1000 * 60 * 5,
  });
}