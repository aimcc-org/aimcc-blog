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
      <main
        className="grid place-items-center min-h-screen text-admin-muted"
        role="status"
      >
        正在验证登录状态…
      </main>
    );

  if (status === "login")
    return (
      <main className="min-h-screen grid place-items-center px-6 py-20 bg-[radial-gradient(ellipse_at_50%_25%,#dae6ff,transparent_60%)]">
        <a
          className="absolute top-[30px] left-9 no-underline text-sm text-admin-muted"
          href="/"
        >
          ← 返回博客
        </a>
        <section className="w-full max-w-[440px] p-11 bg-admin-surface border border-admin-border rounded-2xl shadow-admin-floating max-[760px]:px-6 max-[760px]:py-8 [&_h1]:mt-[18px] [&_h1]:mb-2.5 [&_h1]:font-admin-display [&_h1]:text-[34px] [&_form]:mt-8 [&_form]:grid [&_form]:gap-3 [&_label]:text-[13px] [&_label]:font-semibold [&_input]:mb-2 [&_form>button]:mt-2">
          <span className="text-admin-primary text-[11px] font-bold tracking-[0.18em]">
            AIMCC / WORKSPACE
          </span>
          <h1>欢迎回来。</h1>
          <p className="text-admin-muted leading-[1.7]">
            登录管理后台，继续记录你的想法。
          </p>
          <form onSubmit={login}>
            <label htmlFor="username">管理员账号</label>
            <input
              className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px]"
              id="username"
              name="username"
              autoComplete="username"
              placeholder="输入账号"
              required
              maxLength={100}
            />
            <label htmlFor="password">密码</label>
            <input
              className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px]"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="输入密码"
              required
            />
            {error && (
              <p
                className="text-[#b42318] bg-[#fff0ed] border border-[#ffcfc6] rounded-md p-3 text-[13px] leading-[1.6]"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5 bg-admin-primary! border-admin-primary! text-white! enabled:hover:bg-admin-primary-hover!"
              disabled={busy}
            >
              {busy ? "正在登录…" : "登录后台 →"}
            </button>
          </form>
          <p className="mt-6 mb-0 text-center text-xs text-admin-subtle">
            仅限管理员访问
          </p>
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
        <div className="mt-auto grid gap-[18px] pt-6 px-3 border-t border-admin-border text-xs [&_a]:no-underline [&_a]:text-admin-muted [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-left [&_button]:text-admin-muted max-[760px]:mt-5 max-[760px]:pt-4 max-[760px]:px-0 max-[760px]:flex max-[760px]:justify-between">
          <span className="text-[#23875d]">● 管理员已登录</span>
          <a href="/">↗ 查看博客</a>
          <button onClick={logout} disabled={busy}>
            {busy ? "正在退出…" : "退出登录"}
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {error && (
          <p
            className="text-[#b42318] bg-[#fff0ed] border border-[#ffcfc6] rounded-md p-3 text-[13px] leading-[1.6]"
            role="alert"
          >
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
