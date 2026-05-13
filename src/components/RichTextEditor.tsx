'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading2, Undo2, Redo2, Code } from 'lucide-react';

// HTML Paste handler to preserve formatting from Word/Google Docs
const HtmlPaste = Extension.create({
  name: 'htmlPaste',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          clipboardTextSerializer: () => '',
          handleDOMEvents: {
            paste(view, event) {
              if (!event.clipboardData) return false;

              const html = event.clipboardData.getData('text/html');
              if (!html) return false;

              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');

              // Get all text content preserving structure
              const nodes: any[] = [];
              const processNode = (node: Node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                  const text = node.textContent;
                  if (text) {
                    nodes.push({ type: 'text', content: text });
                  }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as HTMLElement;
                  const tagName = element.tagName.toLowerCase();

                  if (['b', 'strong'].includes(tagName)) {
                    nodes.push({ type: 'bold_start' });
                    Array.from(element.childNodes).forEach(processNode);
                    nodes.push({ type: 'bold_end' });
                  } else if (['i', 'em'].includes(tagName)) {
                    nodes.push({ type: 'italic_start' });
                    Array.from(element.childNodes).forEach(processNode);
                    nodes.push({ type: 'italic_end' });
                  } else if (['u'].includes(tagName)) {
                    nodes.push({ type: 'underline_start' });
                    Array.from(element.childNodes).forEach(processNode);
                    nodes.push({ type: 'underline_end' });
                  } else if (['p', 'div', 'span'].includes(tagName)) {
                    Array.from(element.childNodes).forEach(processNode);
                  } else {
                    Array.from(element.childNodes).forEach(processNode);
                  }
                }
              };

              Array.from(doc.body.childNodes).forEach(processNode);

              // Convert parsed nodes to editor content
              let text = '';
              let marks: any[] = [];

              for (const node of nodes) {
                if (node.type === 'text') {
                  text += node.content;
                } else if (node.type === 'bold_start') {
                  marks.push({ type: 'bold', from: text.length });
                } else if (node.type === 'bold_end') {
                  const boldMark = marks.find(m => m.type === 'bold' && !m.to);
                  if (boldMark) boldMark.to = text.length;
                } else if (node.type === 'italic_start') {
                  marks.push({ type: 'italic', from: text.length });
                } else if (node.type === 'italic_end') {
                  const italicMark = marks.find(m => m.type === 'italic' && !m.to);
                  if (italicMark) italicMark.to = text.length;
                } else if (node.type === 'underline_start') {
                  marks.push({ type: 'underline', from: text.length });
                } else if (node.type === 'underline_end') {
                  const underlineMark = marks.find(m => m.type === 'underline' && !m.to);
                  if (underlineMark) underlineMark.to = text.length;
                }
              }

              // Insert content with marks
              const { state, dispatch } = view;
              const { from, to } = state.selection;
              const tr = state.tr.replaceWith(from, to, state.schema.text(text));

              // Apply marks
              for (const mark of marks) {
                if (mark.to) {
                  const markType = state.schema.marks[mark.type];
                  if (markType) {
                    tr.addMark(from + mark.from, from + mark.to, markType.create());
                  }
                }
              }

              dispatch(tr);
              event.preventDefault();
              return true;
            }
          }
        }
      })
    ];
  }
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  minHeight = 200
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      HtmlPaste,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph'
          }
        }
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'link'
        }
      })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: 'full'
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  const buttonClass = (isActive: boolean) => `
    p-2 rounded text-white transition-colors text-xs
    ${isActive ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}
    disabled:opacity-50
  `;

  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-700">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-600 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={toggleBold}
          disabled={disabled}
          className={buttonClass(editor.isActive('bold'))}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          disabled={disabled}
          className={buttonClass(editor.isActive('italic'))}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleUnderline}
          disabled={disabled}
          className={buttonClass(editor.isActive('underline'))}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-600" />

        <button
          type="button"
          onClick={toggleBulletList}
          disabled={disabled}
          className={buttonClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleOrderedList}
          disabled={disabled}
          className={buttonClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-600" />

        <button
          type="button"
          onClick={toggleCodeBlock}
          disabled={disabled}
          className={buttonClass(editor.isActive('codeBlock'))}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-600" />

        <button
          type="button"
          onClick={undo}
          disabled={disabled || !editor.can().undo()}
          className={buttonClass(false)}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={disabled || !editor.can().redo()}
          className={buttonClass(false)}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        style={{ minHeight: `${minHeight}px` }}
        className="w-full px-4 py-3 text-white bg-slate-700 [&_p]:text-white [&_p]:my-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:ml-2 [&_code]:bg-slate-900 [&_code]:px-1 [&_code]:rounded [&_code]:text-red-400 [&_code]:text-sm [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_a]:text-blue-400 [&_a]:underline"
      >
        <EditorContent editor={editor} />
      </div>

      {/* Hint */}
      <div className="bg-slate-800 border-t border-slate-600 px-4 py-2 text-xs text-gray-400">
        Paste from Google Docs, Word, or other rich text editors - formatting will be preserved!
      </div>
    </div>
  );
}
