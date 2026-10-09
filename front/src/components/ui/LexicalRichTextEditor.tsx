import React, { useCallback, useEffect, useState } from 'react';
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  EditorState,
  LexicalEditor,
} from 'lexical';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo,
  Redo,
  Sparkles,
} from 'lucide-react';

interface LexicalRichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

// Toolbar Plugin
const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-slate-300 dark:border-[#444444] bg-slate-100 dark:bg-slate-200 rounded-t-xl select-none">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={`p-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
          isBold
            ? 'bg-black text-white shadow-xs'
            : 'text-black hover:bg-slate-300/80 active:bg-slate-400/80'
        }`}
        title="Negrito (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: isBold ? '#FFFFFF' : '#000000' }} />
      </button>

      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`p-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
          isItalic
            ? 'bg-black text-white shadow-xs'
            : 'text-black hover:bg-slate-300/80 active:bg-slate-400/80'
        }`}
        title="Itálico (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: isItalic ? '#FFFFFF' : '#000000' }} />
      </button>

      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={`p-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
          isUnderline
            ? 'bg-black text-white shadow-xs'
            : 'text-black hover:bg-slate-300/80 active:bg-slate-400/80'
        }`}
        title="Sublinhado (Ctrl+U)"
      >
        <Underline className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: isUnderline ? '#FFFFFF' : '#000000' }} />
      </button>

      <div className="w-px h-4 bg-slate-400 mx-0.5" />

      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="p-1.5 rounded-lg text-xs font-black text-black hover:bg-slate-300/80 active:bg-slate-400/80 transition-all cursor-pointer"
        title="Lista com Marcadores"
      >
        <List className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: '#000000' }} />
      </button>

      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="p-1.5 rounded-lg text-xs font-black text-black hover:bg-slate-300/80 active:bg-slate-400/80 transition-all cursor-pointer"
        title="Lista Numerada"
      >
        <ListOrdered className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: '#000000' }} />
      </button>

      <div className="w-px h-4 bg-slate-400 mx-0.5" />

      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-1.5 rounded-lg text-xs font-black text-black hover:bg-slate-300/80 active:bg-slate-400/80 transition-all cursor-pointer"
        title="Desfazer (Ctrl+Z)"
      >
        <Undo className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: '#000000' }} />
      </button>

      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-1.5 rounded-lg text-xs font-black text-black hover:bg-slate-300/80 active:bg-slate-400/80 transition-all cursor-pointer"
        title="Refazer (Ctrl+Y)"
      >
        <Redo className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: '#000000' }} />
      </button>
    </div>
  );
};

// Sync Initial / External Value Plugin
const SyncValuePlugin: React.FC<{ value?: string }> = ({ value }) => {
  const [editor] = useLexicalComposerContext();
  const [lastValue, setLastValue] = useState<string | undefined>(value);

  useEffect(() => {
    if (value !== undefined && value !== lastValue) {
      setLastValue(value);
      editor.update(() => {
        const root = $getRoot();
        const currentText = root.getTextContent();
        if (currentText !== value) {
          root.clear();
          const lines = (value || '').split(/\r?\n/);
          for (const line of lines) {
            const paragraph = $createParagraphNode();
            if (line) {
              paragraph.append($createTextNode(line));
            }
            root.append(paragraph);
          }
        }
      });
    }
  }, [value, editor, lastValue]);

  return null;
};

const editorTheme = {
  paragraph: 'mb-1 text-slate-800 dark:text-[#FFFFFF] text-xs sm:text-sm leading-relaxed',
  text: {
    bold: 'font-extrabold text-slate-900 dark:text-[#FFFFFF]',
    italic: 'italic',
    underline: 'underline underline-offset-2',
  },
  list: {
    ul: 'list-disc ml-5 mb-1 text-slate-800 dark:text-[#FFFFFF] space-y-0.5',
    ol: 'list-decimal ml-5 mb-1 text-slate-800 dark:text-[#FFFFFF] space-y-0.5',
    listitem: 'text-xs sm:text-sm',
  },
};

export const LexicalRichTextEditor: React.FC<LexicalRichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Descreva os detalhes, ingredientes, opções ou receitas...',
  minHeight = '90px',
  maxHeight = '220px',
  className = '',
}) => {
  const initialConfig: InitialConfigType = {
    namespace: 'CatalogoExpressRichEditor',
    theme: editorTheme,
    nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode],
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    editorState: () => {
      const root = $getRoot();
      if (root.isEmpty() && value) {
        const lines = value.split(/\r?\n/);
        for (const line of lines) {
          const p = $createParagraphNode();
          if (line) {
            p.append($createTextNode(line));
          }
          root.append(p);
        }
      }
    },
  };

  const handleEditorChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      if (onChange) {
        onChange(textContent);
      }
    });
  };

  return (
    <div
      className={`relative w-full rounded-xl border border-slate-300 dark:border-[#444444] bg-white dark:bg-[#1E1E1E] shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden ${className}`}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{ minHeight, maxHeight }}
                className="w-full p-3 text-xs sm:text-sm text-slate-800 dark:text-[#FFFFFF] outline-none overflow-y-auto leading-relaxed"
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-xs sm:text-sm text-slate-400 dark:text-[#757575] pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleEditorChange} />
          <SyncValuePlugin value={value} />
        </div>
      </LexicalComposer>
    </div>
  );
};
