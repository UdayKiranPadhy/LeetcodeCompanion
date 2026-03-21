import katex from 'katex';

const LINK_STYLE = 'color:var(--color-accent);text-decoration:underline;text-underline-offset:2px';

function renderInline(text: string): string {
  let result = text.replace(/\$([^$\n]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  });

  return result
    // Standard markdown links [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="${LINK_STYLE}">$1</a>`)
    // Bare URLs in brackets [https://...]
    .replace(/\[(https?:\/\/[^\]]+)\]/g, `<a href="$1" target="_blank" rel="noopener noreferrer" style="${LINK_STYLE}">$1</a>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-code);background:var(--color-bg-secondary);padding:1px 5px;border-radius:3px;font-size:0.9em">$1</code>');
}

const HEADING_STYLE = 'font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--color-text-primary);margin:16px 0 6px';

function processLines(text: string): string {
  const lines = text.split('\n');
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // h3
    if (/^### (.+)$/.test(line)) {
      parts.push(`<h3 style="${HEADING_STYLE}">${renderInline(line.slice(4))}</h3>`);
      i++;
    }
    // h2
    else if (/^## (.+)$/.test(line)) {
      parts.push(`<h3 style="${HEADING_STYLE}">${renderInline(line.slice(3))}</h3>`);
      i++;
    }
    // Unordered list (- or *)
    else if (/^[*-] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[*-] /.test(lines[i])) {
        items.push(`<li style="margin-bottom:4px">${renderInline(lines[i].slice(2))}</li>`);
        i++;
      }
      parts.push(`<ul style="margin:8px 0 8px 20px;list-style:disc">${items.join('')}</ul>`);
    }
    // Numbered list
    else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li style="margin-bottom:4px">${renderInline(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      parts.push(`<ol style="margin:8px 0 8px 20px">${items.join('')}</ol>`);
    }
    // Empty line
    else if (line.trim() === '') {
      i++;
    }
    // Normal paragraph
    else {
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^#{1,3} /.test(lines[i]) &&
        !/^[*-] /.test(lines[i]) &&
        !/^\d+\. /.test(lines[i])
      ) {
        paraLines.push(renderInline(lines[i]));
        i++;
      }
      if (paraLines.length > 0) {
        parts.push(`<p style="margin-top:8px">${paraLines.join('<br/>')}</p>`);
      }
    }
  }

  return parts.join('');
}

export function renderMarkdown(text: string): string {
  // Split on fenced code blocks and block math first, preserving them as-is
  const segments = text.split(/(```[\s\S]*?```|\$\$[\s\S]+?\$\$)/g);

  return segments.map(seg => {
    // Fenced code block
    if (seg.startsWith('```')) {
      const firstNewline = seg.indexOf('\n');
      const code = (firstNewline > -1 ? seg.slice(firstNewline + 1) : seg.slice(3))
        .replace(/```$/, '').trimEnd();
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre style="margin:10px 0;padding:12px 14px;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow-x:auto"><code style="font-family:var(--font-code);font-size:var(--text-sm);color:var(--color-text-primary)">${escaped}</code></pre>`;
    }
    // Block math
    if (seg.startsWith('$$') && seg.endsWith('$$')) {
      const math = seg.slice(2, -2).trim();
      try {
        return `<div style="overflow-x:auto;margin:12px 0">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
      } catch {
        return seg;
      }
    }
    return processLines(seg);
  }).join('');
}
