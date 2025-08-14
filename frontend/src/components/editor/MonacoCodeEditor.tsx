import React, { useRef, useEffect, useState } from 'react';
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
	console.log('🔍 MonacoCodeEditor component is rendering with code:', code.substring(0, 50));
	
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

	// 应用装饰器 - 基于官方API
	const applyDecorations = (symbols: Array<{ line: number; column: number; symbol: string }>) => {
		if (!editorRef.current || !monacoRef.current) {
			console.log('❌ Editor or Monaco not ready');
			return;
		}

		const editor = editorRef.current;
		const monaco = monacoRef.current;

		try {
			// 清除现有装饰器
			if (decorations.length > 0) {
				editor.deltaDecorations(decorations, []);
			}

			// 创建新的装饰器 - 使用官方Range对象
			const newDecorations = symbols.map(({ line, column, symbol }) => ({
				range: new monaco.Range(line, column, line, column + 1),
				options: {
					inlineClassName: 'chinese-symbol-highlight',
					hoverMessage: { value: `点击替换为: ${chineseSymbols[symbol]}` },
				},
			}));

			// 应用装饰器 - 使用官方deltaDecorations方法
			const appliedDecorations = editor.deltaDecorations([], newDecorations);
			setDecorations(appliedDecorations);
			
			console.log(`✅ Applied ${symbols.length} decorations:`, appliedDecorations);
			
		} catch (error) {
			console.error('❌ Error applying decorations:', error);
		}
	};

	// 编辑器挂载 - 基于官方示例
	const handleEditorDidMount = (editor: any, monaco: any) => {
		console.log('🚀 Monaco Editor mounted successfully');
		console.log('Editor instance:', editor);
		console.log('Monaco object:', monaco);
		
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
					// 使用官方executeEdits方法
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
			console.log('✅ Chinese symbol styles injected');
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
			{/* 调试信息 */}
			<div className="absolute top-2 left-2 z-20 bg-blue-100 border border-blue-300 rounded p-2 text-xs">
				<div>Monaco Editor - 中文符号检测</div>
				<div>装饰器数量: {decorations.length}</div>
				<div>检查控制台日志</div>
			</div>

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
