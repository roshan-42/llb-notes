interface NoteBlock {
  id: string;
  type: 'heading' | 'subheading' | 'body' | 'image';
  content_en: string;
  content_np: string;
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
              <figure key={block.id} className="my-8">
                {text && (
                  <img
                    src={text}
                    alt="Note illustration"
                    className="w-full h-auto rounded-lg border border-slate-700"
                  />
                )}
              </figure>
            );
          case 'body':
          default:
            return (
              <p key={block.id} className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {text}
              </p>
            );
        }
      })}
    </div>
  );
}
