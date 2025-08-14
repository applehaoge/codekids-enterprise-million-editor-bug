import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

interface MonacoCodeEditorProps {
	code: string;
	onChange: (value: string) => void;
	language?: string;
	theme?: string;
	onError?: (error: string) => void;
	onSave?: () => void;
	readOnly?: boolean;
}

export default function MonacoCodeEditor({
	code,
	onChange,
	language = 'python',
	theme = 'vs-dark',
	onError,
	onSave,
	readOnly = false,
}: MonacoCodeEditorProps) {
	const editorRef = useRef<any>(null);
	const monacoRef = useRef<any>(null);
	const [decorations, setDecorations] = useState<string[]>([]);

	// 中文符号映射
	const chineseSymbols: Record<string, string> = {
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
		'"': '"',
		'"': '"',
		''': "'",
		''': "'",
	};

	// 检测中文符号
	const detectChineseSymbols = (text: string) => {
		const symbols: Array<{ line: number; column: number; symbol: string }> = [];
		const lines = text.split('\n');
		
		lines.forEach((line, lineIndex) => {
			line.split('').forEach((char, charIndex) => {
				if (chineseSymbols[char]) {
					symbols.push({
						line: lineIndex + 1,
						column: charIndex + 1,
						symbol: char,
					});
				}
			});
		});
		
		return symbols;
	};

	// 应用装饰器
	const applyDecorations = (symbols: Array<{ line: number; column: number; symbol: string }>) => {
		if (!editorRef.current || !monacoRef.current) return;

		const editor = editorRef.current;
		const monaco = monacoRef.current;

		// 清除现有装饰器
		if (decorations.length > 0) {
			editor.deltaDecorations(decorations, []);
		}

		// 创建新的装饰器
		const newDecorations = symbols.map(({ line, column, symbol }) => ({
			range: new monaco.Range(line, column, line, column + 1),
			options: {
				inlineClassName: 'chinese-symbol-highlight',
				hoverMessage: { value: `点击替换为: ${chineseSymbols[symbol]}` },
			},
		}));

		// 应用装饰器
		const appliedDecorations = editor.deltaDecorations([], newDecorations);
		setDecorations(appliedDecorations);
	};

	// 编辑器挂载
	const handleEditorDidMount = (editor: any, monaco: any) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		// 保存快捷键
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			onSave?.();
		});

		// 监听内容变化
		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			const symbols = detectChineseSymbols(value);
			applyDecorations(symbols);
			onChange(value);
		});

		// 监听鼠标点击
		editor.onMouseDown((e: any) => {
			if (!e.target.position) return;
			
			const { lineNumber, column } = e.target.position;
			const symbols = detectChineseSymbols(editor.getValue());
			const hitSymbol = symbols.find(s => s.line === lineNumber && s.column === column);
			
			if (hitSymbol) {
				const replacement = chineseSymbols[hitSymbol.symbol];
				if (replacement) {
					editor.executeEdits('replace-chinese-symbol', [{
						range: new monaco.Range(lineNumber, column, lineNumber, column + 1),
						text: replacement,
					}]);
				}
			}
		});

		// 初始检测
		const initialSymbols = detectChineseSymbols(code);
		applyDecorations(initialSymbols);
	};

	const handleEditorChange = (value?: string) => {
		if (value === undefined) return;
		onChange(value);
	};

	// 注入CSS样式
	useEffect(() => {
		const styleId = 'chinese-symbol-styles';
		if (!document.getElementById(styleId)) {
			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = `
				.chinese-symbol-highlight {
					background-color: rgba(255, 0, 0, 0.3) !important;
					border-bottom: 2px solid #ff0000 !important;
					cursor: pointer !important;
				}
				.chinese-symbol-highlight:hover {
					background-color: rgba(255, 0, 0, 0.5) !important;
				}
			`;
			document.head.appendChild(style);
		}
	}, []);

	// 外部代码变化时重新检测
	useEffect(() => {
		if (editorRef.current) {
			const symbols = detectChineseSymbols(code);
			applyDecorations(symbols);
		}
	}, [code]);

	return (
		<div className="relative w-full h-full">
			<Editor
				height="100%"
				language={language}
				theme={theme}
				value={code}
				onChange={handleEditorChange}
				onMount={handleEditorDidMount}
				options={{
					readOnly,
					minimap: { enabled: false },
					fontSize: 16,
					wordWrap: 'on',
					automaticLayout: true,
				}}
			/>
		</div>
	);
}
