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
      el.innerHTML = el.innerHTML.replaceAll(mathRegex, (_, tex) => {
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

// Diagrams are printed in the Ex Libris inks (paper, sumi, soft ink), never a
// second accent. Colours are read from the live --gk-* tokens when drawn, so a
// diagram always matches the page and its theme. Mermaid cannot parse oklch,
// so each token is resolved to hex through a 1×1 canvas.
function tokenHex(name: string, fallback: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  probe.style.display = 'none';
  document.body.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();

  const ctx = document.createElement('canvas').getContext('2d', {
    willReadFrequently: true,
  });

  if (!ctx || !computed) {
    return fallback;
  }

  ctx.fillStyle = fallback;
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const DIAGRAM_FONT = '"JMH Typewriter", monospace';

function diagramTheme() {
  const paper = tokenHex('--gk-paper', '#f5efe3');
  const raised = tokenHex('--gk-paper-raised', '#f9f5ec');
  const deep = tokenHex('--gk-paper-deep', '#ece4d6');
  const ink = tokenHex('--gk-ink', '#27221f');
  const soft = tokenHex('--gk-ink-soft', '#5d544c');

  return {
    variables: {
      background: 'transparent',
      fontFamily: DIAGRAM_FONT,
      fontSize: '13px',
      primaryColor: raised,
      secondaryColor: paper,
      tertiaryColor: deep,
      primaryBorderColor: ink,
      secondaryBorderColor: soft,
      tertiaryBorderColor: soft,
      lineColor: soft,
      textColor: ink,
      primaryTextColor: ink,
      secondaryTextColor: ink,
      tertiaryTextColor: ink,
      nodeTextColor: ink,
      nodeBorder: ink,
      mainBkg: raised,
      clusterBkg: 'transparent',
      clusterBorder: soft,
      edgeLabelBackground: paper,
      titleColor: ink,
      // Sequence and state diagrams share the same inks
      actorBkg: raised,
      actorBorder: ink,
      actorTextColor: ink,
      signalColor: soft,
      signalTextColor: ink,
      noteBkgColor: deep,
      noteBorderColor: soft,
      noteTextColor: ink,
    },
  };
}

// Typewritten plates drawn straight from the app's tokens. The SVG is inline
// in the page, so its stylesheet reads the live --gk-* variables: paper fills,
// sumi strokes, soft-ink connectors, decisions edged in indigo, and an optional
// `verdict` class (vermilion edge) for an outcome, e.g. `I:::verdict`.
// The hex theme above only seeds what Mermaid computes itself.
function diagramCss(): string {
  return `
    svg { font-family: ${DIAGRAM_FONT}; }
    .node rect, .node circle, .node ellipse, .node path, .actor, .note {
      fill: var(--gk-paper-raised) !important;
      stroke: var(--gk-ink) !important;
      stroke-width: 1.5px !important;
    }
    .node rect, .actor { rx: 3px; ry: 3px; }
    .node polygon {
      fill: var(--gk-paper-raised) !important;
      stroke: var(--gk-indigo) !important;
      stroke-width: 1.5px !important;
    }
    .node.verdict rect, .node.verdict polygon {
      stroke: var(--gk-stamp) !important;
    }
    .node.verdict .label text, .node.verdict .nodeLabel {
      fill: var(--gk-stamp-ink) !important;
    }
    .nodeLabel, .label text, .label tspan, text.actor, .messageText {
      fill: var(--gk-ink) !important;
      color: var(--gk-ink) !important;
    }
    .flowchart-link, .edgePath .path, .messageLine0, .messageLine1, .relation {
      stroke: var(--gk-ink-soft) !important;
      stroke-width: 1.25px !important;
    }
    .marker, marker path, .arrowheadPath {
      fill: var(--gk-ink-soft) !important;
      stroke: var(--gk-ink-soft) !important;
    }
    .edgeLabel rect, .labelBkg { fill: transparent !important; background: transparent !important; }
    .edgeLabel text, .edgeLabel tspan {
      fill: var(--gk-ink-soft) !important; font-size: 12px; letter-spacing: 0.04em;
      paint-order: stroke; stroke: var(--gk-paper-deep); stroke-width: 6px; stroke-linejoin: round;
    }
    .cluster rect {
      fill: transparent !important;
      stroke: var(--gk-ink-faint) !important;
      stroke-dasharray: 3 3; stroke-width: 1px !important;
    }
    .cluster-label text, .cluster-label tspan { fill: var(--gk-ink-soft) !important; }
  `;
}

// Each drawn diagram keeps its source, so a theme change can redraw it in
// the new palette without reloading the article
export async function renderMermaidDiagrams(): Promise<void> {
  const mermaid = await import('mermaid');
  const theme = diagramTheme();

  mermaid.default.initialize({
    startOnLoad: false,
    theme: 'base',
    // Mermaid 12 defaults to ELK and the neo look; keep the dagre layout and
    // classic look these diagrams are tuned for
    layout: 'dagre',
    look: 'classic',
    fontFamily: DIAGRAM_FONT,
    themeVariables: theme.variables,
    themeCSS: diagramCss(),
    // SVG text, not HTML: centred labels the article's prose styles can't reach
    htmlLabels: false,
    flowchart: {
      htmlLabels: false,
      // Smooth, unhurried connectors: no step jogs around the loops
      curve: 'basis',
      padding: 14,
      nodeSpacing: 40,
      rankSpacing: 44,
      // Mermaid 12 wraps labels at 120px and pads every node to that width;
      // size each node to its own label, as before
      wrappingWidth: 200,
      minNodeWidth: 0,
      useMaxWidth: true,
    },
    sequence: { useMaxWidth: true },
  });

  const targets = document.querySelectorAll<HTMLElement>(
    'pre > code.language-mermaid, .mermaid-diagram[data-source]',
  );

  for (const target of targets) {
    const isSource = target.tagName === 'CODE';
    const host = isSource ? target.parentElement : target;
    const code = isSource
      ? target.textContent || ''
      : target.dataset.source || '';

    if (!host || !code) {
      continue;
    }

    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    const { svg } = await mermaid.default.render(id, code);

    if (!isSource) {
      host.innerHTML = svg;
      continue;
    }

    const div = document.createElement('div');
    div.className = 'mermaid-diagram';
    div.dataset.source = code;
    div.innerHTML = svg;
    host.replaceWith(div);
  }
}

/** Redraws the article's diagrams whenever the reader switches theme. */
export function watchThemeForDiagrams(): () => void {
  if (typeof MutationObserver === 'undefined') {
    return () => {};
  }

  const root = document.documentElement;
  let theme = root.getAttribute('data-theme');
  const observer = new MutationObserver(() => {
    const next = root.getAttribute('data-theme');

    if (next !== theme) {
      theme = next;

      if (document.querySelector('.mermaid-diagram[data-source]')) {
        renderMermaidDiagrams().catch(() => {});
      }
    }
  });

  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  return () => observer.disconnect();
}
