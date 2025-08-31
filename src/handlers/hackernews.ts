function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function handleHackerNews(url: URL) {
  const res = await fetch(url);

  const hackerNewsHandler = {
    title: '',
    url: '',
    element(element: Element) {
      const href = element.getAttribute('href') || '';
      this.url = new URL(href, url).href;
    },
    text(text: Text) {
      this.title += text.text;
    },
  };
  await new HTMLRewriter().on('span.titleline>a', hackerNewsHandler).transform(res).text();

  const title = escapeHtml(`${hackerNewsHandler.title}`);
  const newHtml = `
    <html>
      <head>
        <title>${title}</title>
        <meta property="og:title" content="${title}"/>
        <meta property="og:description" content=""/>
        <meta property="og:site_name" content="Hacker News"/>
        <meta property="og:image" content="https://news.ycombinator.com/y18.svg"/>
      </head>
      <body>
      </body>
    </html>
  `;

  return new Response(newHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
