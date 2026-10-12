import type { Draft } from "@/types/draft";
export interface DraftTableProps {
  rows: Draft[];
  disabled: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
