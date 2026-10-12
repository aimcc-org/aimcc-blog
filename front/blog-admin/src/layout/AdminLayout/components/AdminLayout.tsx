import type { AdminLayoutProps } from "../types";
import { Button, Layout, Menu, Space } from "antd";

import { blogUrl } from "@/config";
import "../styles/layout.css";
export default function AdminLayout({
  publish,
  busy,
  logout,
  children,
}: AdminLayoutProps) {
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
      <Layout.Content className="workspace-content">{children}</Layout.Content>
    </Layout>
  );
}
