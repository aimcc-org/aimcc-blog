import { Alert, Spin } from "antd";
import { useSession } from "./hooks/useSession";
import AdminLayout from "./layout/AdminLayout";
import LoginPage from "./pages/LoginPage";
import PublishPage from "./pages/PublishPage";
import DraftsPage from "./pages/DraftsPage";
export default function App() {
  const session = useSession();
  const publish = window.location.pathname.startsWith("/publish");
  if (session.status === "loading")
    return (
      <div className="login-page">
        <Spin tip="正在验证登录状态…">
          <div style={{ minHeight: 100 }} />
        </Spin>
      </div>
    );
  if (session.status === "login") return <LoginPage session={session} />;
  return (
    <AdminLayout publish={publish} busy={session.busy} logout={session.logout}>
      {session.error && <Alert type="error" title={session.error} />}
      {publish ? (
        <PublishPage key={session.accountId} accountId={session.accountId} />
      ) : (
        <DraftsPage key={session.accountId} accountId={session.accountId} />
      )}
    </AdminLayout>
  );
}
