import { generateMinimumHtmlForPreview, TextExtractor } from './generic';

export async function handleHackerNews(url: URL) {
  const res = await fetch(url);

  const titleExtractor = new TextExtractor();
  const userExtractor = new TextExtractor();
  const sourceSiteExtractor = new TextExtractor();
  const topTextExtractor = new TextExtractor();

  await new HTMLRewriter()
    .on('span.titleline>a', titleExtractor)
    .on('span.subline>span.sitestr', sourceSiteExtractor)
    .on('span.subline>a.hnuser', userExtractor)
    .on('div.toptext', topTextExtractor)
    .transform(res)
    .text();

  let title = titleExtractor.content;
  if (sourceSiteExtractor.content) {
    title += ` (${sourceSiteExtractor.content})`;
  }

  let description = `by ${userExtractor.content}`;
  if (topTextExtractor.content) {
    description += `\n${topTextExtractor.content}`;
  }

  const metadata = {
    title: title,
    description: description,
    site_name: 'Hacker News',
    image: 'https://news.ycombinator.com/y18.svg',
  };

  const newHtml = generateMinimumHtmlForPreview(metadata);
  return new Response(newHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
