import type { ArticleOutlineProps } from "../types";
import { Collapse } from "antd";

export default function ArticleOutline({ editor }: ArticleOutlineProps) {
  const { draft } = editor;
  return (
    <>
      <Collapse
        size="small"
        defaultActiveKey={["outline"]}
        items={[
          {
            key: "outline",
            label: "文章目录",
            children: draft.content
              .split("\n")
              .filter((line) => /^#{1,3}\s/.test(line))
              .map((line, i) => (
                <div key={i}>{line.replace(/^#+\s+/, "")}</div>
              )),
          },
        ]}
      />
    </>
  );
}
