export function DomainReplacingHandler(newHostname: string) {
  return async (url: URL) => {
    const newUrl = new URL(url);
    newUrl.hostname = newHostname;
    return Response.redirect(newUrl.toString(), 302);
  };
}

export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class OpenGraphMetadataExtractor {
  metadata: Record<string, string> = {};

  element(element: Element) {
    if (element.tagName !== 'meta') {
      return;
    }

    const content = element.getAttribute('content') || '';
    if (content === '') {
      return;
    }

    const name = element.getAttribute('name') || '';
    const property = element.getAttribute('property') || '';
    let key = '';

    // <meta name="..." />
    if (['description', 'author'].includes(name)) {
      key = name;
    }

    // Already OpenGraph
    if (property.startsWith('og:')) {
      this.metadata[property.substring(3)] = content;
    }
  }
}

export class TextExtractor {
  content: string = '';
  text(text: Text) {
    const trimmedText = text.text.trim();
    if (trimmedText !== '') {
      this.content += (this.content ? ' ' : '') + trimmedText;
    }
  }
}

export function generateMinimumHtmlForPreview(
  metadata: Record<string, string>
): string {
  const headLines = [];
  headLines.push(`<title>${metadata.title}</title>`);

  for (const [key, value] of Object.entries(metadata)) {
    headLines.push(
      `<meta property="og:${escapeHtml(key)}" content="${escapeHtml(value)}"/>`,
    );
  }

  return '<html><head>' + headLines.join('') + '</head><body></body></html>';
}
