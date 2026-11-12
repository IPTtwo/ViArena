export function streamEmbedUrl(raw) {
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return '';
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      const id =
        url.searchParams.get('v') ||
        url.pathname.match(/^\/(?:live|shorts|embed)\/([A-Za-z0-9_-]{11})/)?.[1];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : '';
    }
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1);
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
    }
    return '';
  } catch {
    return '';
  }
}
