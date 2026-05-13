'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Undo2, Redo2, Code, Grid3x3 } from 'lucide-react';

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
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div style={{ minHeight: `${minHeight}px` }} className="bg-slate-700 border border-slate-600 rounded-lg animate-pulse" />;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
  const insertTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  const deleteTable = () => editor.chain().focus().deleteTable().run();
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded text-white transition-colors text-xs ${
      isActive ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
    } disabled:opacity-50`;

  return (
    <div className="flex flex-col border border-slate-600 rounded-lg overflow-hidden bg-slate-700">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-600 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={toggleBold}
          disabled={disabled}
          className={buttonClass(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          disabled={disabled}
          className={buttonClass(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleUnderline}
          disabled={disabled}
          className={buttonClass(editor.isActive('underline'))}
          title="Underline"
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
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px bg-slate-600" />

        <button
          type="button"
          onClick={insertTable}
          disabled={disabled}
          className={buttonClass(editor.isActive('table'))}
          title="Insert Table"
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={deleteTable}
          disabled={disabled || !editor.isActive('table')}
          className={buttonClass(false)}
          title="Delete Table"
        >
          <span className="text-xs">✕ Table</span>
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

      {/* Editor Content Area */}
      <div
        style={{ minHeight: `${minHeight}px` }}
        className="flex-1 overflow-auto bg-slate-700 px-4 py-3 text-base text-white"
      >
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none prose-sm
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:text-base
            [&_.ProseMirror]:text-white
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:my-3
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:my-2
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:my-2
            [&_p]:text-white [&_p]:my-2 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2
            [&_li]:text-white [&_li]:my-1
            [&_strong]:font-bold [&_strong]:text-white
            [&_em]:italic [&_em]:text-gray-200
            [&_u]:underline [&_u]:underline-offset-2
            [&_code]:bg-slate-900 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-orange-400 [&_code]:text-sm
            [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-2
            [&_blockquote]:border-l-4 [&_blockquote]:border-amber-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2
            [&_a]:text-blue-400 [&_a]:underline
            [&_table]:border-collapse [&_table]:w-full [&_table]:my-4
            [&_thead]:bg-slate-800
            [&_th]:border [&_th]:border-slate-600 [&_th]:px-3 [&_th]:py-2 [&_th]:text-white [&_th]:font-semibold [&_th]:text-left
            [&_td]:border [&_td]:border-slate-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-white
            [&_tbody_tr]:hover:bg-slate-800/50"
        />
      </div>

      {/* Info */}
      <div className="bg-slate-800 border-t border-slate-600 px-4 py-2 text-xs text-gray-400">
        Paste from Google Docs, Word - formatting (bold, italic, lists, paragraphs) preserved
      </div>
    </div>
  );
}
