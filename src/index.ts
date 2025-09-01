import { handleWeixin } from './handlers/weixin';
import { handleHackerNews } from './handlers/hackernews';
import { DomainReplacingHandler } from './handlers/generic';

const HANDLER_MAP: { [key: string]: (url: URL) => Promise<Response> } = {
  'mp.weixin.qq.com': handleWeixin,
  'news.ycombinator.com': handleHackerNews,
  // https://github.com/FxEmbed/FxEmbed
  'twitter.com': DomainReplacingHandler('fixupx.com'),
  'x.com': DomainReplacingHandler('fixupx.com'),
  // https://github.com/MinnDevelopment/fxreddit
  'reddit.com': DomainReplacingHandler('rxddit.com'),
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const urlParsed = new URL(request.url);
    let extractedUrl = urlParsed.pathname.slice(1) + urlParsed.search;

    // Try to parse the extracted URL. If it fails, try adding "http://" prefix.
    let extractedUrlParsed: URL | undefined;

    for (let _ = 0; _ < 2; _++) {
      try {
        extractedUrlParsed = new URL(extractedUrl);
        break;
      } catch (e) {
        extractedUrl = 'https://' + extractedUrl;
        continue;
      }
    }

    if (!extractedUrlParsed) {
      return new Response('Invalid URL', { status: 400 });
    }

    // If the request comes from a browser, just redirect to the extracted URL.
    if (request.headers.get('user-agent')?.startsWith('Mozilla/5.0')) {
      return Response.redirect(extractedUrl, 302);
    }

    // Find the most suitable handler by progressively stripping subdomains.
    let host = extractedUrlParsed.hostname;
    while (!HANDLER_MAP[host] && host.includes('.')) {
      host = host.slice(host.indexOf('.') + 1);
    }

    if (!HANDLER_MAP[host]) {
      return new Response('Invalid hostname', { status: 403 });
    }

    return HANDLER_MAP[host](extractedUrlParsed);
  },
} as ExportedHandler<Env>;
