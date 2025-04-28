async function handleTwitter(url: URL) {
  const newUrl = new URL(url);
  newUrl.hostname = 'fixupx.com';
  return Response.redirect(newUrl.toString(), 302);
}

async function handleWeixin(url: URL) {
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5666.197 Safari/537.36',
    },
  });

  if (res.status !== 200) {
    return new Response('Error fetching the request', { status: 500 });
  }

  return new Response(res.body, {
    headers: {
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}

const HANDLER_MAP: { [key: string]: (url: URL) => Promise<Response> } = {
  'mp.weixin.qq.com': handleWeixin,
  'twitter.com': handleTwitter,
  'x.com': handleTwitter,
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
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
} satisfies ExportedHandler<Env>;
