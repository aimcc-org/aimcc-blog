import "./styles/home-controls.less";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@aimcc/react-component";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export default function HomeControls() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);
  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <div className="home-nav__actions" aria-label="首页操作">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="home-nav__icon-button"
            type="button"
            aria-label="打开搜索"
          >
            <span aria-hidden="true">⌕</span>
          </Button>
        </DialogTrigger>
        <Button
          variant="ghost"
          className="home-nav__icon-button"
          type="button"
          aria-label={`切换到${nextTheme === "dark" ? "深色" : "浅色"}模式`}
          onClick={() => {
            applyTheme(nextTheme);
            setTheme(nextTheme);
          }}
        >
          <span aria-hidden="true">{theme === "dark" ? "☾" : "☼"}</span>
        </Button>
      </div>
      <DialogContent
        className="home-dialog home-dialog__panel"
        overlayClassName="home-dialog__backdrop"
        showCloseButton={false}
      >
        <div className="home-dialog__header">
          <DialogTitle>搜索文章</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="home-nav__icon-button"
              type="button"
              aria-label="关闭搜索"
            >
              <span aria-hidden="true">×</span>
            </Button>
          </DialogClose>
        </div>
        <Input
          className="home-dialog__input"
          aria-label="搜索文章"
          placeholder="搜索功能即将上线"
          disabled
        />
        <DialogDescription>
          搜索入口已预留，后续可以接入 Pagefind 或服务端搜索 API。
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
