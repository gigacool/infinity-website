import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const sortedPosts = posts.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'n∞sia Blog',
    description: 'Articles about learning, skills, and professional growth.',
    site: context.site ?? 'https://infinity.noosia.digital',
    items: sortedPosts.map((post) => {
      const [lang, ...slugParts] = post.id.split('/');
      const slug = slugParts.join('/').replace(/\.mdx?$/, '');
      return {
        title: `[${lang.toUpperCase()}] ${post.data.title}`,
        pubDate: post.data.date,
        description: post.data.description,
        link: `/${lang}/blog/${slug}`,
      };
    }),
  });
}
