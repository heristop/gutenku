export async function renderMathFormulas(): Promise<void> {
  const katex = await import('katex');
  await import('katex/dist/katex.min.css');

  const contentEl = document.querySelector('.blog-article__body');

  if (!contentEl) {
    return;
  }

  // Match $$ ... $$ (display math) - marked may wrap in <p> tags
  const mathRegex = /\$\$([\s\S]*?)\$\$/g;

  // Process all elements that might contain math
  const elements = contentEl.querySelectorAll('p, li, td');

  for (const el of elements) {
    if (el.innerHTML.includes('$$')) {
      el.innerHTML = el.innerHTML.replace(mathRegex, (_, tex) => {
        try {
          return `<span class="katex-display">${katex.default.renderToString(
            tex.trim(),
            {
              displayMode: true,
              throwOnError: false,
            },
          )}</span>`;
        } catch {
          return `<code class="katex-error">${tex}</code>`;
        }
      });
    }
  }
}

const LIGHT_MERMAID_THEME = {
  background: 'transparent',
  primaryColor: '#e8e2d9',
  secondaryColor: '#f5f0e8',
  tertiaryColor: '#dcd5c9',
  primaryBorderColor: '#5a7a6b',
  secondaryBorderColor: '#7a9a8b',
  lineColor: '#5a7a6b',
  textColor: '#2d3b35',
  primaryTextColor: '#2d3b35',
  secondaryTextColor: '#2d3b35',
  tertiaryTextColor: '#2d3b35',
  nodeTextColor: '#2d3b35',
  nodeBorder: '#5a7a6b',
  clusterBkg: '#f5f0e8',
  edgeLabelBackground: '#f5f0e8',
  fontFamily: '"JMH Typewriter", monospace',
};

const DARK_MERMAID_THEME = {
  background: 'transparent',
  primaryColor: '#2a3a35',
  secondaryColor: '#1e2d28',
  tertiaryColor: '#243530',
  primaryBorderColor: '#6b9a8b',
  secondaryBorderColor: '#5a8a7b',
  lineColor: '#6b9a8b',
  textColor: '#c8d5d0',
  primaryTextColor: '#c8d5d0',
  secondaryTextColor: '#b8c5c0',
  tertiaryTextColor: '#a8b5b0',
  nodeTextColor: '#c8d5d0',
  nodeBorder: '#6b9a8b',
  clusterBkg: '#1e2d28',
  edgeLabelBackground: '#2a3a35',
  fontFamily: '"JMH Typewriter", monospace',
};

export async function renderMermaidDiagrams(): Promise<void> {
  const mermaid = await import('mermaid');
  const isDark =
    document.documentElement.getAttribute('data-theme') === 'dark';

  mermaid.default.initialize({
    startOnLoad: false,
    theme: 'base',
    fontFamily: '"JMH Typewriter", monospace',
    themeVariables: isDark ? DARK_MERMAID_THEME : LIGHT_MERMAID_THEME,
  });

  const mermaidBlocks = document.querySelectorAll(
    'pre code.language-mermaid',
  );

  for (const block of mermaidBlocks) {
    const pre = block.parentElement;

    if (pre) {
      const code = block.textContent || '';
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      const { svg } = await mermaid.default.render(id, code);
      const div = document.createElement('div');
      div.className = 'mermaid-diagram';
      div.innerHTML = svg;
      pre.replaceWith(div);
    }
  }
}
