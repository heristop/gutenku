export interface IFileSystemService {
  ensureDirectory(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
}

export const IFileSystemServiceToken = 'IFileSystemService';
