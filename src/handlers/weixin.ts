import {
  OpenGraphMetadataExtractor,
  generateMinimumHtmlForPreview,
  TextExtractor,
} from './generic';

export async function handleWeixin(url: URL) {
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5666.197 Safari/537.36',
    },
  });

  if (res.status !== 200) {
    return new Response('Error fetching the request', { status: 500 });
  }

  const metadataExtractor = new OpenGraphMetadataExtractor();
  const contentExtractor = new TextExtractor();

  // Workaround for "Unknown character encoding has been provided" error.
  const modifiedRes = new Response(res.body, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });

  await new HTMLRewriter()
    .on('meta', metadataExtractor)
    .on('#js_content', contentExtractor)
    .transform(modifiedRes)
    .bytes();

  const metadata = metadataExtractor.metadata;
  if (!metadata.description) {
    metadata.description = contentExtractor.content;
  }

  const newHtml = generateMinimumHtmlForPreview(metadata);
  return new Response(newHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
