import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const requirePwa = createRequire(require.resolve('vite-plugin-pwa'));
const { getManifest } = requirePwa('workbox-build');

it('collects app assets for offline precaching with the installed dependency tree', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'gutenku-precache-'));

  try {
    await mkdir(join(directory, 'assets'));
    await writeFile(join(directory, 'assets/app.js'), 'console.log("app");');
    await writeFile(join(directory, 'assets/app.css'), 'body { margin: 0; }');

    const manifest = await getManifest({
      globDirectory: directory,
      globPatterns: ['**/*.{js,css}'],
    });

    expect(manifest.warnings).toEqual([]);
    expect(
      manifest.manifestEntries.map(({ url }: { url: string }) => url).sort(),
    ).toEqual(['assets/app.css', 'assets/app.js']);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
