import React, { useRef, useEffect } from 'react';
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

	// 编辑器挂载 - 最小化测试版本
	const handleEditorDidMount = (editor: any, monaco: any) => {
		console.log('🚀 Monaco Editor mounted successfully');
		console.log('Editor instance:', editor);
		console.log('Monaco object:', monaco);
		
		editorRef.current = editor;
		
		// 保存快捷键
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			onSave?.();
		});

		// 监听内容变化
		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			console.log('📝 Content changed:', value.substring(0, 50));
			onChange(value);
		});

		console.log('🎯 Editor ready for testing!');
	};

	const handleEditorChange = (value?: string) => {
		if (value !== undefined) {
			onChange(value);
		}
	};

	return (
		<div className="relative w-full h-full">
			{/* 调试信息 */}
			<div className="absolute top-2 left-2 z-20 bg-blue-100 border border-blue-300 rounded p-2 text-xs">
				<div>Monaco Editor - 最小化测试版本</div>
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
					// 最小化配置 - 只保留最基本功能
					readOnly,
					fontSize: 16,
					wordWrap: 'on',
					automaticLayout: true,
					
					// 完全禁用可能导致SVG问题的功能
					minimap: { enabled: false },
					lineNumbers: 'on',
					glyphMargin: false,
					folding: false,
					lineDecorationsWidth: 0,
					
					// 禁用所有装饰器和渲染功能
					renderLineHighlight: 'none',
					scrollBeyondLastLine: false,
					renderValidationDecorations: 'off',
					overviewRulerBorder: false,
					hideCursorInOverviewRuler: true,
					overviewRulerLanes: 0,
					renderWhitespace: 'none',
					renderControlCharacters: false,
					renderLineHighlightOnlyWhenFocus: true,
					
					// 禁用高级功能
					largeFileOptimizations: false,
					maxTokenizationLineLength: 1000,
					
					// 禁用所有可能导致SVG的功能
					contextmenu: false,
					quickSuggestions: false,
					suggestOnTriggerCharacters: false,
					acceptSuggestionOnEnter: 'off',
					tabCompletion: 'off',
					wordBasedSuggestions: 'off',
					parameterHints: { enabled: false },
					hover: { enabled: false },
					links: false,
					colorDecorators: false,
					// 暂时注释掉不兼容的配置
				}}
			/>
		</div>
	);
}
