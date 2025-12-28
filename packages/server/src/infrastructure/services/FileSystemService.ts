import { injectable } from 'tsyringe';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { IFileSystemService } from '~/domain/gateways/IFileSystemService';

@injectable()
export class FileSystemService implements IFileSystemService {
  async ensureDirectory(path: string): Promise<void> {
    try {
      await mkdir(path, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
      if (
        error instanceof Error &&
        'code' in error &&
        error.code !== 'EEXIST'
      ) {
        throw error;
      }
    }
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(path: string): Promise<string> {
    return await readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    // Create parent directory if needed
    await this.ensureDirectory(dirname(path));
    await writeFile(path, content, 'utf-8');
  }
}
