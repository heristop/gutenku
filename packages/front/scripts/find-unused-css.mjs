import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const IGNORE_PATTERNS = [
  // Vue transition classes
  /-enter-active$/,
  /-leave-active$/,
  /-enter-from$/,
  /-leave-to$/,
  /-enter-to$/,
  /-leave-from$/,
  /-move$/,
  // Vue router
  /^router-link/,
  /^router-view/,
  // Dynamic/generated classes
  /^particle-\d+$/,
  /^stagger-\d+$/,
  /^brush-stroke-\d+$/,
  /^w3$/,
  /^org$/,
  /^scss$/,
  /^com$/,
  /^io$/,
  /^zen-btn$/,
  /^zen-card/,
  /^zen-chip/,
  /^zen-modal/,
  /^zen-progress/,
  /^zen-dropdown/,
  /^zen-toast/,
  /^zen-tooltip/,
  /^is-/,
  /^has-/,
  /^no-/,
];

function shouldIgnore(className) {
  return IGNORE_PATTERNS.some((pattern) => pattern.test(className));
}

function getVueFiles(dir, files = []) {
  for (const file of readdirSync(dir)) {
    const path = join(dir, file);
    if (statSync(path).isDirectory()) {
      getVueFiles(path, files);
    } else if (extname(file) === '.vue') {
      files.push(path);
    }
  }
  return files;
}

function extractStyleClasses(styleContent) {
  const classes = new Set();
  const classRegex =
    /\.([a-z][a-z0-9-]*(?:__[a-z][a-z0-9-]*)?(?:--[a-z][a-z0-9-]*)?)/gi;
  let match;
  while ((match = classRegex.exec(styleContent)) !== null) {
    const className = match[1];
    if (!shouldIgnore(className)) {
      classes.add(className);
    }
  }
  return classes;
}

function extractTemplateClasses(templateContent) {
  const classes = new Set();

  const staticClassRegex = /class="([^"]+)"/g;
  let match;
  while ((match = staticClassRegex.exec(templateContent)) !== null) {
    match[1].split(/\s+/).forEach((c) => classes.add(c));
  }

  const dynamicStrRegex = /:class="[^"]*'([a-z][a-z0-9-_]*)'/gi;
  while ((match = dynamicStrRegex.exec(templateContent)) !== null) {
    classes.add(match[1]);
  }

  const dynamicObjRegex = /'([a-z][a-z0-9-_]*)'\s*:/gi;
  while ((match = dynamicObjRegex.exec(templateContent)) !== null) {
    classes.add(match[1]);
  }

  const transitionRegex = /name="([^"]+)"/g;
  while ((match = transitionRegex.exec(templateContent)) !== null) {
    const name = match[1];
    classes.add(name + '-enter-active');
    classes.add(name + '-leave-active');
  }

  return classes;
}

function analyzeVueFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');

  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  const template = templateMatch ? templateMatch[1] : '';

  const styleMatch = content.match(
    /<style[^>]*scoped[^>]*>([\s\S]*?)<\/style>/,
  );
  const style = styleMatch ? styleMatch[1] : '';

  if (!style) {
    return null;
  }

  const definedClasses = extractStyleClasses(style);
  const usedClasses = extractTemplateClasses(template);

  const unused = [...definedClasses].filter((c) => {
    const blockName = c.split('__')[0].split('--')[0];
    return (
      !usedClasses.has(c) &&
      !usedClasses.has(blockName) &&
      ![...usedClasses].some(
        (u) =>
          u.startsWith(blockName + '__') ||
          u.startsWith(blockName + '--') ||
          u === blockName,
      )
    );
  });

  return unused.length > 0 ? { file: filePath, unused } : null;
}

const srcDir = './src';
const vueFiles = getVueFiles(srcDir);
const results = [];

for (const file of vueFiles) {
  const result = analyzeVueFile(file);
  if (result) {
    results.push(result);
  }
}

console.log('Unused CSS Class Detection (filtered)\n');
console.log(
  'Ignoring: Vue transitions, router classes, dynamic patterns, Zen UI\n',
);

if (results.length === 0) {
  console.log('✓ No unused CSS classes found');
} else {
  let total = 0;
  for (const { file, unused } of results) {
    const shortPath = file.replace('./src/', 'src/');
    console.log(shortPath + ':');
    unused.forEach((c) => console.log('  .' + c));
    console.log();
    total += unused.length;
  }
  console.log('Total: ' + total + ' potentially unused classes');
}
