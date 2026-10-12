import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Menu,
  Space,
  Spin,
  Typography,
} from "antd";
import { adminRequest, adminToken, AdminApiError } from "./lib/admin-api";
import { blogUrl } from "./lib/config";
import MarkdownEditor from "./components/MarkdownEditor";

export default function App() {
  const [status, setStatus] = useState<"loading" | "login" | "ready">(
    "loading",
  );
  const [accountId, setAccountId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const publish = window.location.pathname.startsWith("/publish");
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
  async function login(values: { username: string; password: string }) {
    setBusy(true);
    setError("");
    try {
      const token = await adminRequest<string>("/login", {
        ...values,
        username: values.username.trim(),
      });
      adminToken.set(token);
      setAccountId(await adminRequest<string>("/session"));
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
      await adminRequest<void>("/logout", {});
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
  if (status === "loading")
    return (
      <div className="login-page">
        <Spin tip="正在验证登录状态…">
          <div style={{ minHeight: 100 }} />
        </Spin>
      </div>
    );
  if (status === "login")
    return (
      <div className="login-page">
        <Card title="AIMCC 博客管理" style={{ width: 400, maxWidth: "100%" }}>
          <Form layout="vertical" onFinish={login}>
            <Form.Item
              label="管理员账号"
              name="username"
              rules={[
                { required: true, whitespace: true, message: "请输入账号" },
              ]}
            >
              <Input autoComplete="username" maxLength={100} />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            {error && <Alert type="error" showIcon title={error} />}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={busy} block>
                登录后台
              </Button>
            </Form.Item>
          </Form>
          <a href={blogUrl}>返回博客</a>
        </Card>
      </div>
    );
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header className="workspace-header">
        <a className="workspace-brand" href="/">
          <svg
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 3C11 3 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-16Z"
              fill="currentColor"
            />
            <path d="m3 22 12-13" stroke="white" strokeWidth="1.5" />
          </svg>
          AIMCC
        </a>
        <Menu
          mode="horizontal"
          className="workspace-menu"
          selectedKeys={[publish ? "publish" : "home"]}
          items={[
            { key: "home", label: <a href="/">文章管理</a> },
            { key: "publish", label: <a href="/publish/">发布文章</a> },
          ]}
        />
        <Space className="workspace-account">
          <Button href={blogUrl}>查看博客</Button>
          <Button loading={busy} onClick={() => void logout()}>
            退出登录
          </Button>
        </Space>
      </Layout.Header>
      <Layout.Content className="workspace-content">
        {error && <Alert type="error" title={error} />}
        <MarkdownEditor
          key={accountId}
          accountId={accountId}
          mode={publish ? "edit" : "manage"}
        />
      </Layout.Content>
    </Layout>
  );
}
