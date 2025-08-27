import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { installSuggestHitband } from "./monaco/suggestHitband";

interface Props {
  value?: string;
  language?: string;
  theme?: string;
  onChange?: (v: string) => void;
  onMount?: (editor: any, monacoNS: any) => void;
}

export default function CodeEditorMonaco({ value = '', language = 'python', theme = 'vs', onChange, onMount }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const editor = monaco.editor.create(containerRef.current, {
      value: value,
      language,
      theme,
      automaticLayout: true,
    });
    editorRef.current = editor;

    try { installSuggestHitband(editor); } catch (e) { console.warn('installSuggestHitband failed', e); }

    const model = editor.getModel();
    const disp = model?.onDidChangeContent(() => { try { onChange?.(editor.getValue()); } catch {} });

    try { onMount?.(editor, monaco); } catch (e) { console.warn('onMount error', e); }

    return () => {
      try { disp?.dispose(); } catch {}
      try { editor.dispose(); } catch {}
      editorRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
