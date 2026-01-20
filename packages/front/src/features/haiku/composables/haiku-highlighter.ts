export interface HighlighterConfig {
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function useHaikuHighlighter(config: HighlighterConfig = {}) {
  const {
    width = 100,
    height = 20,
    primaryColor = '#ffd700',
    secondaryColor = '#ffed4e',
  } = config;

  const generateHandDrawnHighlighter = (): string => {
    const baseY = height / 2 - 3;

    const waveIntensity = 1 + Math.random() * 2;
    const strokeWidth = 8 + Math.random() * 4;
    const opacity1 = 0.4 + Math.random() * 0.3;
    const opacity2 = 0.2 + Math.random() * 0.3;
    const rotation = -2 + Math.random() * 4;

    const path1 = `M0,${baseY + Math.random() * 2 - 1}
      Q${width * 0.25},${baseY + (Math.random() - 0.5) * waveIntensity}
      ${width * 0.5},${baseY + (Math.random() - 0.5) * waveIntensity}
      T${width},${baseY + Math.random() * 2 - 1}
      L${width},${baseY + strokeWidth + Math.random() * 2}
      Q${width * 0.75},${baseY + strokeWidth + (Math.random() - 0.5) * waveIntensity}
      ${width * 0.5},${baseY + strokeWidth + (Math.random() - 0.5) * waveIntensity}
      T0,${baseY + strokeWidth + Math.random() * 2 - 1} Z`;

    const path2 = `M0,${baseY + Math.random() * 1.5 - 0.75}
      Q${width * 0.3},${baseY + (Math.random() - 0.5) * waveIntensity * 0.8}
      ${width * 0.6},${baseY + (Math.random() - 0.5) * waveIntensity * 0.8}
      T${width},${baseY + Math.random() * 1.5 - 0.75}
      L${width},${baseY + strokeWidth * 0.8 + Math.random() * 1.5}
      Q${width * 0.7},${baseY + strokeWidth * 0.8 + (Math.random() - 0.5) * waveIntensity * 0.8}
      ${width * 0.4},${baseY + strokeWidth * 0.8 + (Math.random() - 0.5) * waveIntensity * 0.8}
      T0,${baseY + strokeWidth * 0.8 + Math.random() * 1.5 - 0.75} Z`;

    const filterId = `roughPaper${Math.random().toString(36).substr(2, 9)}`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <filter id="${filterId}">
          <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="${Math.random() * 100}"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5"/>
        </filter>
      </defs>
      <g transform="rotate(${rotation} ${width / 2} ${height / 2})">
        <path d="${path1}" fill="${primaryColor}" opacity="${opacity1}" filter="url(#${filterId})"/>
        <path d="${path2}" fill="${secondaryColor}" opacity="${opacity2}"/>
      </g>
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const applyHighlight = (element: HTMLElement): void => {
    const uniquePattern = generateHandDrawnHighlighter();
    const randomTranslateY = -0.5 + Math.random() * 1;
    const randomRotation = -1 + Math.random() * 2;

    element.style.setProperty(
      '--unique-highlighter-bg',
      `url("${uniquePattern}")`,
    );
    element.style.setProperty(
      '--unique-transform',
      `translateY(${randomTranslateY}px) rotate(${randomRotation}deg)`,
    );
  };

  const processHighlightsInBatches = (
    highlights: NodeListOf<Element>,
    batchSize = 5,
  ): void => {
    let index = 0;

    const processBatch = () => {
      const end = Math.min(index + batchSize, highlights.length);
      for (let i = index; i < end; i++) {
        applyHighlight(highlights[i] as HTMLElement);
      }
      index = end;

      if (index < highlights.length) {
        requestAnimationFrame(processBatch);
      }
    };

    processBatch();
  };

  const applyToAllHighlights = (
    selector = '.chapter-text mark, .chapter-text .highlight',
  ): void => {
    const runHighlighting = () => {
      const highlights = document.querySelectorAll(selector);
      if (highlights.length === 0) {
        return;
      }

      processHighlightsInBatches(highlights);
    };

    if ('requestIdleCallback' in globalThis) {
      requestIdleCallback(() => runHighlighting(), { timeout: 2000 });
    } else {
      setTimeout(runHighlighting, 100);
    }
  };

  return {
    applyToAllHighlights,
  };
}
