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

	// 编辑器挂载 - 最简单的测试版本
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
				<div>Monaco Editor - 测试版本</div>
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
