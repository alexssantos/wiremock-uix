import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "@/app/providers/theme-provider";

type JsonEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  language?: "json" | "xml" | "html" | "plaintext";
  readOnly?: boolean;
  height?: number | string;
  onMount?: OnMount;
};

/**
 * Thin wrapper around Monaco Editor, pre-configured with sane defaults
 * (line numbers, minimap off, format-on-paste) and wired to the app theme.
 */
export function JsonEditor({ value, onChange, language = "json", readOnly = false, height = 320, onMount }: JsonEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
      onChange={(next) => onChange?.(next ?? "")}
      onMount={onMount}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        formatOnPaste: true,
        tabSize: 2,
      }}
    />
  );
}
