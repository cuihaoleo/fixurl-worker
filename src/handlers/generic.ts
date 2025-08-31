export function DomainReplacingHandler(newHostname: string) {
  return async (url: URL) => {
    const newUrl = new URL(url);
    newUrl.hostname = newHostname;
    return Response.redirect(newUrl.toString(), 302);
  };
}
