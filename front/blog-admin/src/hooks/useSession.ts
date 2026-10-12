import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import { AdminApiError } from "@/services/request";
import { adminToken } from "@/utils/session-token";
export function useSession() {
  const [status, setStatus] = useState<"loading" | "login" | "ready">(
    "loading",
  );
  const [accountId, setAccountId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        if (!adminToken.get()) {
          if (active) setStatus("login");
          return;
        }
        const id = await authService.session();
        if (active) {
          setAccountId(id);
          setStatus("ready");
        }
      } catch (cause) {
        if (active) {
          setStatus("login");
          setError(
            cause instanceof AdminApiError
              ? cause.message
              : "暂时无法连接服务，请稍后重新登录。",
          );
        }
      }
    }
    void checkSession();
    window.addEventListener("focus", checkSession);
    return () => {
      active = false;
      window.removeEventListener("focus", checkSession);
    };
  }, []);
  async function login(values: { username: string; password: string }) {
    setBusy(true);
    setError("");
    try {
      const token = await authService.login(values);
      adminToken.set(token);
      setAccountId(await authService.session());
      setStatus("ready");
    } catch (cause) {
      setError(
        cause instanceof AdminApiError
          ? cause.message
          : "登录失败，请检查网络连接后重试。",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await authService.logout();
      adminToken.clear();
      setStatus("login");
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.code === 401)
        setStatus("login");
      else setError("退出失败，请检查网络后重试。");
    } finally {
      setBusy(false);
    }
  }
  return { status, accountId, busy, error, login, logout };
}
