import { Header } from "@aimcc/react-component";
import HomeControls from "./HomeControls";

export default function BlogHeader({
  title,
  pathname,
  overlay = false,
}: {
  title: string;
  pathname: string;
  overlay?: boolean;
}) {
  return (
    <Header
      title={title}
      overlay={overlay}
      tone={overlay ? "inverse" : "default"}
      links={[
        { href: "/", label: "首页", active: pathname === "/" },
        { href: "/archive/", label: "归档", active: pathname === "/archive/" },
        { href: "/about/", label: "关于", active: pathname === "/about/" },
      ]}
      actions={<HomeControls />}
    />
  );
}
