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
	const [isEditorReady, setIsEditorReady] = useState(false);

	// 简单的测试函数
	const testMonacoFeatures = () => {
		if (!editorRef.current) {
			console.log('❌ Editor not ready');
			return;
		}

		console.log('✅ Editor is ready');
		console.log('📝 Current value:', editorRef.current.getValue());
		console.log('🔧 Editor options:', editorRef.current.getOption('readOnly'));
		
		// 注入测试样式
		const id = 'test-decoration-style';
		if (!document.getElementById(id)) {
			const style = document.createElement('style');
			style.id = id;
			style.textContent = `
				.test-decoration {
					background-color: rgba(255,0,0,0.3) !important;
					border-bottom: 2px solid #ff0000 !important;
				}
			`;
			document.head.appendChild(style);
		}
		
		// 测试添加一个简单的装饰器
		try {
			const model = editorRef.current.getModel();
			if (model) {
				console.log('📄 Model URI:', model.uri.toString());
				
				// 尝试添加一个装饰器到第一行
				const decorations = editorRef.current.deltaDecorations([], [{
					range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 10 },
					options: {
						inlineClassName: 'test-decoration',
						hoverMessage: { value: 'Test decoration' }
					}
				}]);
				console.log('🎨 Decorations applied:', decorations);
			}
		} catch (error) {
			console.error('❌ Error applying decorations:', error);
		}
	};

	const onMount: OnMount = (editor, monaco) => {
		console.log('🚀 Monaco Editor mounted');
		console.log('🔧 Editor instance:', editor);
		
		editorRef.current = editor;
		setIsEditorReady(true);

		// 保存快捷键
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			console.log('💾 Save command triggered');
			onSave?.();
		});

		// 监听内容变化
		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			console.log('📝 Content changed, length:', value.length);
			onChange(value);
		});

		// 监听鼠标点击
		editor.onMouseDown((e) => {
			console.log('🖱️ Mouse down event:', e);
		});

		// 延迟测试功能
		setTimeout(testMonacoFeatures, 1000);
	};

	const handleEditorChange = (value?: string) => {
		if (value === undefined) return;
		console.log('🔄 Editor change handler:', value.substring(0, 50));
		onChange(value);
	};

	useEffect(() => {
		if (isEditorReady) {
			console.log('🔧 Editor ready, testing features...');
			testMonacoFeatures();
		}
	}, [isEditorReady]);

	return (
		<div className="relative w-full h-full">
			{/* 调试信息 */}
			<div className="absolute top-2 left-2 z-20 bg-blue-100 border border-blue-300 rounded p-2 text-xs">
				<div>Editor Ready: {isEditorReady ? '✅' : '❌'}</div>
				<button 
					onClick={testMonacoFeatures}
					className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
				>
					测试功能
				</button>
			</div>

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
