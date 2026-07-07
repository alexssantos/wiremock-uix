import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { FileTreeNode } from "@/entities/file";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { ScrollArea } from "@/shared/ui/scroll-area";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);
const CODE_EXTENSIONS = new Set(["xml", "html", "htm", "css", "js", "mjs", "ts", "tsx", "jsx", "yaml", "yml"]);

function getFileIcon(filePath: string): LucideIcon {
  const extension = filePath.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    return FileJson;
  }

  if (extension && IMAGE_EXTENSIONS.has(extension)) {
    return ImageIcon;
  }

  if (extension && CODE_EXTENSIONS.has(extension)) {
    return FileCode;
  }

  return FileText;
}

type TreeNodeItemProps = {
  depth: number;
  node: FileTreeNode;
  selectedPath?: string;
  onSelect: (path: string) => void;
};

function TreeNodeItem({ depth, node, selectedPath, onSelect }: TreeNodeItemProps) {
  const isActive = selectedPath === node.path;
  const containsSelection = Boolean(selectedPath && selectedPath.startsWith(`${node.path}/`));
  const [open, setOpen] = useState(containsSelection);

  useEffect(() => {
    if (containsSelection) {
      setOpen(true);
    }
  }, [containsSelection]);

  if (node.isFolder) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              containsSelection && "bg-accent/60 text-accent-foreground"
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            type="button"
          >
            {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
            {open ? <FolderOpen className="size-4 text-primary" /> : <Folder className="size-4 text-primary" />}
            <span className="truncate">{node.name}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {node.children.map((child) => (
            <TreeNodeItem key={child.path} depth={depth + 1} node={child} selectedPath={selectedPath} onSelect={onSelect} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const FileIcon = getFileIcon(node.path);

  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
      style={{ paddingLeft: `${depth * 16 + 32}px` }}
      type="button"
      onClick={() => onSelect(node.path)}
    >
      <FileIcon className="size-4 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

type FileTreeProps = {
  nodes: FileTreeNode[];
  selectedPath?: string;
  onSelect: (path: string) => void;
};

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  return (
    <Card className="min-h-[32rem]">
      <CardHeader>
        <CardTitle>File tree</CardTitle>
        <CardDescription>Virtual folders are derived from slash-separated file names in WireMock.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ScrollArea className="h-[calc(100vh-18rem)] min-h-[24rem] px-2">
          <div className="space-y-1 pr-2">
            {nodes.map((node) => (
              <TreeNodeItem key={node.path} depth={0} node={node} selectedPath={selectedPath} onSelect={onSelect} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
