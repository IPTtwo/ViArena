const escapeXml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c],
  );
export function certificateSvg(user, event, issuedAt) {
  const name = escapeXml(user.name),
    title = escapeXml(event.title),
    date = escapeXml(
      new Date(issuedAt).toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1123 794" role="img"><rect width="1123" height="794" fill="#f8fafd"/><rect x="40" y="40" width="1043" height="714" rx="18" fill="white" stroke="#00296B" stroke-width="7"/><text x="561" y="162" fill="#00296B" font-size="36" font-family="sans-serif" text-anchor="middle" font-weight="700">ViArena</text><text x="561" y="268" font-size="52" text-anchor="middle" font-family="serif" fill="#14233B">Certificate of Participation</text><text x="561" y="348" font-size="24" text-anchor="middle" fill="#52647B" font-family="sans-serif">Presented to</text><text x="561" y="420" font-size="42" text-anchor="middle" fill="#00296B" font-family="sans-serif" font-weight="700">${name}</text><text x="561" y="477" font-size="22" text-anchor="middle" fill="#52647B" font-family="sans-serif">For verified participation in</text><text x="561" y="535" font-size="27" text-anchor="middle" fill="#14233B" font-family="sans-serif">${title.slice(0, 55)}</text><text x="561" y="640" font-size="19" text-anchor="middle" fill="#52647B" font-family="sans-serif">Issued ${date}</text></svg>`;
}
