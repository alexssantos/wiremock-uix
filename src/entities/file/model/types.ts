export type WireMockFile = {
  name: string;
};

export type FileTreeNode = {
  name: string;
  path: string;
  isFolder: boolean;
  children: FileTreeNode[];
};
