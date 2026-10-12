import type { LoginPageProps } from "../types";
import { Alert, Button, Card, Form, Input } from "antd";
import { blogUrl } from "@/config";

export default function LoginPage({ session }: LoginPageProps) {
  const { busy, error, login } = session;
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
}
