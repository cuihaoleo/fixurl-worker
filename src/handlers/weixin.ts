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

  return new Response(res.body, {
    headers: {
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}
