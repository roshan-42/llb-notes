import katex from 'katex';

export function processHtmlWithMath(html: string): string {
  // Process display math ($$...$$)
  // Non-greedy match to get content between $$ pairs
  let processed = html.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (match, math) => {
      const trimmed = math.trim();
      // Skip empty math blocks
      if (!trimmed) return '';
      try {
        const rendered = katex.renderToString(trimmed, {
          displayMode: true,
          throwOnError: false,
        });
        return `<div class="math-display">${rendered}</div>`;
      } catch (e) {
        return match;
      }
    }
  );

  // Process inline math ($...$) - be careful not to match parts of words
  // Look for $ not preceded or followed by another $ or alphanumeric
  processed = processed.replace(
    /([^$\w]|^)\$([^\s$][^$]*[^\s$]|[^\s$])\$([^$\w]|$)/g,
    (match, before, math, after) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
        return `${before}<span class="math-inline">${rendered}</span>${after}`;
      } catch (e) {
        return match;
      }
    }
  );

  return processed;
}
