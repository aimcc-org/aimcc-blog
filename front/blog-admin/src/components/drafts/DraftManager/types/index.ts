import type { DraftStore } from "@/types/draft";
export interface DraftManagerProps {
  store: DraftStore;
  disabled: boolean;
  saveStatus: string;
  message: string;
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
