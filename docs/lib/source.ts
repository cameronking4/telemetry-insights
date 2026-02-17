import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

// Cast: generated collection type can be inferred as never when virtual module isn't fully resolved
const docsCollection = docs as { toFumadocsSource(): unknown };

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docsCollection.toFumadocsSource() as Parameters<typeof loader>[0]['source'],
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const data = page.data as typeof page.data & { getText?(key: 'raw' | 'processed'): Promise<string> };
  const processed = data.getText ? await data.getText('processed') : '';

  return `# ${page.data.title}

${processed}`;
}
