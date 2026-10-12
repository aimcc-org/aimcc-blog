import { Button, Input } from "@aimcc/react-component";
import { useEffect, useState, type ComponentProps } from "react";
import { adminRequest, adminToken, AdminApiError } from "@/lib/admin-api";
import MarkdownEditor from "./MarkdownEditor";
import AdminIcon from "./AdminIcon";

export default function AdminWorkspace({ page }: { page: "home" | "publish" }) {
  const [status, setStatus] = useState<"loading" | "login" | "ready">(
    "loading",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        if (!adminToken.get()) {
          if (active) setStatus("login");
          return;
        }
        const id = await adminRequest<string>("/session");
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

  const login: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    event,
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const token = await adminRequest<string>("/login", {
        username: String(data.get("username")).trim(),
        password: String(data.get("password")),
      });
      adminToken.set(token);
      const id = await adminRequest<string>("/session");
      setAccountId(id);
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
  };

  async function logout() {
    setBusy(true);
    setError("");
    try {
      await adminRequest<void>("/logout", {});
      adminToken.clear();
      window.location.assign("/admin/");
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.code === 401) {
        setStatus("login");
      } else {
        setError("退出失败，请检查网络后重试。");
      }
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading")
    return (
      <main className="admin-session-loading" role="status">
        正在验证登录状态…
      </main>
    );

  if (status === "login")
    return (
      <main className="admin-login">
        <a className="admin-login__back" href="/">
          ← 返回博客
        </a>
        <section className="admin-login__panel">
          <span className="admin-eyebrow">AIMCC / WORKSPACE</span>
          <h1>欢迎回来。</h1>
          <p className="admin-intro">登录管理后台，继续记录你的想法。</p>
          <form onSubmit={login}>
            <label htmlFor="username">管理员账号</label>
            <Input
              className="admin-form-control"
              id="username"
              name="username"
              autoComplete="username"
              placeholder="输入账号"
              required
              maxLength={100}
            />
            <label htmlFor="password">密码</label>
            <Input
              className="admin-form-control"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="输入密码"
              required
            />
            {error && (
              <p className="admin-error-notice" role="alert">
                {error}
              </p>
            )}
            <Button
              variant="ghost"
              className="admin-action-primary"
              disabled={busy}
            >
              {busy ? "正在登录…" : "登录后台 →"}
            </Button>
          </form>
          <p className="admin-login__note">仅限管理员访问</p>
        </section>
      </main>
    );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin/">
          <span className="admin-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <strong>AIMCC</strong>
        </a>
        <p className="admin-brand-caption">博客管理</p>
        <div className="admin-nav-label">工作空间</div>
        <nav className="admin-navigation" aria-label="后台菜单">
          <a href="/admin/" aria-current={page === "home" ? "page" : undefined}>
            <AdminIcon name="grid" />
            <span>文章管理</span>
          </a>
          <a
            href="/admin/publish/"
            aria-current={page === "publish" ? "page" : undefined}
          >
            <AdminIcon name="plus" />
            <span>发布文章</span>
          </a>
          <a href="/admin/?view=trash">
            <AdminIcon name="trash" />
            <span>回收站</span>
          </a>
        </nav>
        <div className="admin-account">
          <span className="admin-account__status">● 管理员已登录</span>
          <a href="/">↗ 查看博客</a>
          <Button
            variant="ghost"
            className="admin-inline-action"
            onClick={logout}
            disabled={busy}
          >
            {busy ? "正在退出…" : "退出登录"}
          </Button>
        </div>
      </aside>
      <main className="admin-main">
        {error && (
          <p className="admin-error-notice" role="alert">
            {error}
          </p>
        )}
        <MarkdownEditor
          key={accountId}
          accountId={accountId}
          mode={page === "publish" ? "edit" : "manage"}
        />
      </main>
    </div>
  );
}
