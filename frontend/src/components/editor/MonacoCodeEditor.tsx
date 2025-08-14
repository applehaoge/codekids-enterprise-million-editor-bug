import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface MonacoCodeEditorProps {
	code: string;
	onChange: (value: string) => void;
	language?: string;
	theme?: string;
	onError?: (error: string) => void;
	onSave?: () => void;
	readOnly?: boolean;
}

const CHINESE_TO_ASCII: Record<string, string> = {
	'，': ',',
	'。': '.',
	'；': ';',
	'：': ':',
	'！': '!',
	'？': '?',
	'（': '(',
	'）': ')',
	'【': '[',
	'】': ']',
	'“': '"',
	'”': '"',
	'‘': "'",
	'’': "'",
};

export default function MonacoCodeEditor({
	code,
	onChange,
	language = 'python',
	theme = 'vs-dark',
	onError,
	onSave,
	readOnly = false,
}: MonacoCodeEditorProps) {
	const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
	const [decorations, setDecorations] = useState<string[]>([]);
	const [symbols, setSymbols] = useState<Array<{ line: number; column: number; symbol: string }>>([]);

	// inject style once
	useEffect(() => {
		const id = 'ck-chinese-symbol-style';
		if (!document.getElementById(id)) {
			const style = document.createElement('style');
			style.id = id;
			style.textContent = `
				.ck-chinese-symbol {
					background-color: rgba(255,0,0,0.18);
					border-bottom: 2px solid #ef4444;
				}
			`;
			document.head.appendChild(style);
		}
	}, []);

	function detectChineseSymbols(text: string) {
		const result: Array<{ line: number; column: number; symbol: string }> = [];
		const lines = text.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			for (let j = 0; j < line.length; j++) {
				const ch = line[j];
				if (CHINESE_TO_ASCII[ch]) {
					result.push({ line: i + 1, column: j + 1, symbol: ch });
				}
			}
		}
		setSymbols(result);
		return result;
	}

	function applyDecorations(items: Array<{ line: number; column: number; symbol: string }>) {
		const editor = editorRef.current;
		const monaco = monacoRef.current;
		if (!editor || !monaco) return;
		
		const model = editor.getModel();
		if (!model) return;
		
		const newDecos = items.map((it) => ({
			range: new monaco.Range(it.line, it.column, it.line, it.column + 1),
			options: {
				inlineClassName: 'ck-chinese-symbol',
				hoverMessage: { value: `点击替换为 ${CHINESE_TO_ASCII[it.symbol]}` },
			},
		}));
		
		const applied = editor.deltaDecorations(decorations, newDecos);
		setDecorations(applied);
	}

	const handleEditorChange = (value?: string) => {
		if (value === undefined) return;
		onChange(value);
		const found = detectChineseSymbols(value);
		applyDecorations(found);
	};

	const onMount: OnMount = (editor, monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco as unknown as typeof import('monaco-editor');

		// Save shortcut
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => onSave?.());

		// Error surface
		const model = editor.getModel();
		if (model) {
			monaco.editor.onDidChangeMarkers(([resource]) => {
				if (resource.toString() !== model.uri.toString()) return;
				const markers = monaco.editor.getModelMarkers({ resource });
				const err = markers.find((m) => m.severity === monaco.MarkerSeverity.Error);
				if (err && onError) onError(err.message);
			});
		}

		// Click to replace
		editor.onMouseDown((e) => {
			if (!e.target.position) return;
			const { lineNumber, column } = e.target.position;
			const hit = symbols.find((s) => s.line === lineNumber && s.column === column);
			if (!hit) return;
			const replacement = CHINESE_TO_ASCII[hit.symbol];
			if (!replacement) return;
			const modelNow = editor.getModel();
			if (!modelNow) return;
			editor.executeEdits('replace-chinese-symbol', [
				{
					range: new (monaco as any).Range(lineNumber, column, lineNumber, column + 1),
					text: replacement,
				},
			]);
			const newValue = modelNow.getValue();
			onChange(newValue);
			const found = detectChineseSymbols(newValue);
			applyDecorations(found);
		});

		// Initial detection
		const initial = detectChineseSymbols(code);
		applyDecorations(initial);
	};

	// Re-apply when external code prop changes
	useEffect(() => {
		const found = detectChineseSymbols(code);
		applyDecorations(found);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code]);

	return (
		<div className="relative w-full h-full">
			<Editor
				height="100%"
				language={language}
				theme={theme}
				value={code}
				onChange={handleEditorChange}
				options={{
					readOnly,
					minimap: { enabled: false },
					fontSize: 16,
					wordWrap: 'on',
					automaticLayout: true,
				}}
				onMount={onMount}
			/>
		</div>
	);
}
