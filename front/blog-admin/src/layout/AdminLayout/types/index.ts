import type { ReactNode } from "react";
export interface AdminLayoutProps {
  publish: boolean;
  busy: boolean;
  logout: () => Promise<void>;
  children: ReactNode;
}
