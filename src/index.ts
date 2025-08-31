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
    const extractedUrl = urlParsed.pathname.slice(1) + urlParsed.search;

    let extractedUrlParsed: URL;

    try {
      extractedUrlParsed = new URL(extractedUrl);
    } catch (e) {
      return new Response('Invalid URL', { status: 400 });
    }

    if (request.headers.get('user-agent')?.startsWith('Mozilla/5.0')) {
      return Response.redirect(extractedUrl, 302);
    }

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
