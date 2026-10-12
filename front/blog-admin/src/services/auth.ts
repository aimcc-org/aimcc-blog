import { adminRequest } from "./request";
export const authService = {
  session: () => adminRequest<string>("/session"),
  login: (values: { username: string; password: string }) =>
    adminRequest<string>("/login", {
      ...values,
      username: values.username.trim(),
    }),
  logout: () => adminRequest<void>("/logout", {}),
};
