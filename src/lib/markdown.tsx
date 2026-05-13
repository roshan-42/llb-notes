export function parseMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Match **bold** or *italic* or ***bold italic***
  const regex = /\*{1,3}(.+?)\*{1,3}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const asterisks = match[0].match(/^\*+/)?.[0] || '';
    const content = match[1];

    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add formatted content
    if (asterisks.length === 3) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          <em>{content}</em>
        </strong>
      );
    } else if (asterisks.length === 2) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          {content}
        </strong>
      );
    } else if (asterisks.length === 1) {
      parts.push(
        <em key={match.index} className="italic">
          {content}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length === 0 ? [text] : parts;
}

export function insertMarkdown(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  format: 'bold' | 'italic'
): string {
  const before = text.substring(0, selectionStart);
  const selected = text.substring(selectionStart, selectionEnd) || 'text';
  const after = text.substring(selectionEnd);

  const marker = format === 'bold' ? '**' : '*';
  return before + marker + selected + marker + after;
}
