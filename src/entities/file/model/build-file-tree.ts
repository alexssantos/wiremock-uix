import type { FileTreeNode } from "@/entities/file/model/types";

type MutableFileTreeNode = {
  name: string;
  path: string;
  isFolder: boolean;
  children: Map<string, MutableFileTreeNode>;
};

function sortNodes(nodes: FileTreeNode[]) {
  return nodes.sort((left, right) => {
    if (left.isFolder !== right.isFolder) {
      return left.isFolder ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}

function toNodeArray(children: Map<string, MutableFileTreeNode>): FileTreeNode[] {
  return sortNodes(
    [...children.values()].map((node) => ({
      name: node.name,
      path: node.path,
      isFolder: node.isFolder,
      children: toNodeArray(node.children),
    }))
  );
}

export function buildFileTree(fileNames: string[]) {
  const root = new Map<string, MutableFileTreeNode>();

  [...fileNames]
    .filter((fileName) => fileName.trim().length > 0)
    .sort((left, right) => left.localeCompare(right))
    .forEach((fileName) => {
      const parts = fileName.split("/").filter(Boolean);
      let currentLevel = root;
      let currentPath = "";

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFolder = index < parts.length - 1;
        let node = currentLevel.get(part);

        if (!node) {
          node = {
            name: part,
            path: currentPath,
            isFolder,
            children: new Map<string, MutableFileTreeNode>(),
          };
          currentLevel.set(part, node);
        }

        currentLevel = node.children;
      });
    });

  return toNodeArray(root);
}
