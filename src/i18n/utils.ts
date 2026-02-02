import fr from './fr.json';
import en from './en.json';

const translations = { fr, en } as const;

export type Language = 'fr' | 'en';
export type Translations = typeof fr;

export const languages: Language[] = ['fr', 'en'];
export const defaultLang: Language = 'fr';

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function getCurrentLang(url: URL): Language {
  const path = url.pathname;
  if (path.startsWith('/en')) return 'en';
  return 'fr';
}

export function getAlternateLang(lang: Language): Language {
  return lang === 'fr' ? 'en' : 'fr';
}

export function getLocalizedPath(path: string, targetLang: Language): string {
  // Remove existing language prefix if present
  const cleanPath = path.replace(/^\/(fr|en)/, '');
  return `/${targetLang}${cleanPath || '/'}`;
}
