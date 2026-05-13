'use client';

import { parseMarkdown } from '@/lib/markdown';
import { processHtmlWithMath } from '@/lib/katex-utils';

interface NoteBlock {
  id: string;
  type: 'heading' | 'subheading' | 'body' | 'image';
  content_en: string;
  content_np?: string;
  caption?: string;
}

function isHtml(content: string): boolean {
  return content.trim().startsWith('<');
}

function HtmlRenderer({ content }: { content: string }) {
  const contentWithMath = processHtmlWithMath(content);

  return (
    <div
      className="prose prose-invert max-w-none
        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-4
        [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-100 [&_h2]:mt-5 [&_h2]:mb-3
        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-200 [&_h3]:mt-4 [&_h3]:mb-2
        [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:my-4
        [&_strong]:font-bold [&_strong]:text-white
        [&_em]:italic [&_em]:text-gray-300
        [&_u]:underline
        [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4
        [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4
        [&_li]:text-gray-300 [&_li]:my-1
        [&_code]:bg-slate-900 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-red-400 [&_code]:text-sm
        [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-4
        [&_blockquote]:border-l-4 [&_blockquote]:border-amber-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-4
        [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300
        [&_table]:border-collapse [&_table]:w-full [&_table]:my-4
        [&_thead]:bg-slate-800
        [&_th]:border [&_th]:border-slate-600 [&_th]:px-3 [&_th]:py-2 [&_th]:text-white [&_th]:font-semibold [&_th]:text-left
        [&_td]:border [&_td]:border-slate-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-gray-300
        [&_tbody_tr]:hover:bg-slate-800/50
        [&_.math-display]:flex [&_.math-display]:justify-center [&_.math-display]:my-4 [&_.math-display]:overflow-x-auto
        [&_.math-inline]:inline
        [&_.katex]:text-gray-300
        [&_.katex_display]:my-2"
      dangerouslySetInnerHTML={{ __html: contentWithMath }}
    />
  );
}

function BlockRenderer({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        const text = block.content_en;

        switch (block.type) {
          case 'heading':
            return (
              <h1 key={block.id} className="text-3xl font-bold text-white">
                {text}
              </h1>
            );
          case 'subheading':
            return (
              <h2 key={block.id} className="text-2xl font-semibold text-gray-100">
                {text}
              </h2>
            );
          case 'image':
            return (
              <figure key={block.id} className="my-8 flex flex-col items-center">
                {text && (
                  <img
                    src={text}
                    alt={block.caption || 'Note illustration'}
                    className="max-h-96 w-auto rounded-lg border border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                {block.caption && (
                  <figcaption className="text-sm text-gray-400 mt-3 text-center italic">
                    Fig: {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case 'body':
          default:
            return (
              <p key={block.id} className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {parseMarkdown(text)}
              </p>
            );
        }
      })}
    </div>
  );
}

export default function NoteBlockRenderer({
  content,
  language = 'en'
}: {
  content: string;
  language?: 'en' | 'np';
}) {
  // Check if content is HTML format (new format)
  if (isHtml(content)) {
    return <HtmlRenderer content={content} />;
  }

  // Otherwise, try to parse as JSON blocks (old format)
  let blocks: NoteBlock[] = [];

  try {
    const parsed = JSON.parse(content);
    blocks = Array.isArray(parsed) ? parsed : [];
  } catch {
    // Fallback: treat as plain text body
    blocks = [{
      id: '1',
      type: 'body',
      content_en: content,
      content_np: ''
    }];
  }

  return <BlockRenderer blocks={blocks} />;
}
