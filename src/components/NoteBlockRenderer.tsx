'use client';

import { parseMarkdown } from '@/lib/markdown';

interface NoteBlock {
  id: string;
  type: 'heading' | 'subheading' | 'body' | 'image';
  content_en: string;
  content_np?: string;
  caption?: string;
}

export default function NoteBlockRenderer({
  content,
  language = 'en'
}: {
  content: string;
  language?: 'en' | 'np';
}) {
  let blocks: NoteBlock[] = [];

  try {
    const parsed = JSON.parse(content);
    blocks = Array.isArray(parsed) ? parsed : [];
  } catch {
    // Old format plain text
    blocks = [{
      id: '1',
      type: 'body',
      content_en: content,
      content_np: ''
    }];
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        const text = language === 'en' ? block.content_en : block.content_np || block.content_en;

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
                    alt={block.caption || "Note illustration"}
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
