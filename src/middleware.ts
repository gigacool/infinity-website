import { defineMiddleware } from 'astro:middleware';

/**
 * Parse Accept-Language header into a sorted list of language preferences.
 * e.g. "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7" → [{ lang: 'fr', q: 1 }, { lang: 'fr', q: 0.9 }, ...]
 */
function parseAcceptLanguage(header: string): { lang: string; q: number }[] {
  return header
    .split(',')
    .map((part) => {
      const [langTag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { lang: langTag.trim().split('-')[0].toLowerCase(), q };
    })
    .sort((a, b) => b.q - a.q);
}

export const onRequest = defineMiddleware(({ request, redirect, url }, next) => {
  // Only handle the root path
  if (url.pathname !== '/') {
    return next();
  }

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const supported = ['fr', 'en'] as const;

  // Find the first supported language in the user's preferences
  const preferences = parseAcceptLanguage(acceptLanguage);
  const match = preferences.find((p) => (supported as readonly string[]).includes(p.lang));
  const lang = match?.lang ?? 'en';

  return redirect(`/${lang}/`, 302);
});
