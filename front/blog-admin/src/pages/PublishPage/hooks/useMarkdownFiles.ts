import { useRef, useState } from "react";
import { readMarkdownFile, downloadMarkdown } from "@/utils/markdown-files";
import type { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
export function useMarkdownFiles(
  workspace: ReturnType<typeof useDraftWorkspace>,
) {
  const { draft, setMessage, addDraft } = workspace;
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  async function loadFile(file: File) {
    setImporting(true);
    setMessage("");
    try {
      const value = await readMarkdownFile(file);
      addDraft(value);
      setMessage(`已将「${file.name}」导入为新草稿，原草稿保留。`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "读取文件失败，请重试",
      );
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function download() {
    downloadMarkdown(draft);
    setMessage("Markdown 文件已导出。");
  }

  return { fileInput, importing, loadFile, download };
}
