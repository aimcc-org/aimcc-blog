import type { useSession } from "@/hooks/useSession";
export interface LoginPageProps {
  session: ReturnType<typeof useSession>;
}
