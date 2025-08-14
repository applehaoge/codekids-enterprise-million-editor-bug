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
	const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
	const [testResult, setTestResult] = useState<string>('等待测试...');

	// 测试基本功能
	const testBasicFeatures = () => {
		console.log('🧪 开始测试基本功能...');
		setTestResult('测试中...');
		
		if (!editorRef.current) {
			const msg = '❌ Editor 引用为空';
			console.log(msg);
			setTestResult(msg);
			return;
		}

		try {
			// 测试 1: 获取值
			const value = editorRef.current.getValue();
			console.log('✅ 获取值成功:', value.substring(0, 50));
			
			// 测试 2: 获取模型
			const model = editorRef.current.getModel();
			if (model) {
				console.log('✅ 获取模型成功:', model.uri.toString());
			} else {
				console.log('❌ 获取模型失败');
			}
			
			// 测试 3: 设置值
			editorRef.current.setValue('print("Hello from test!")');
			console.log('✅ 设置值成功');
			
			// 测试 4: 获取选项
			const readOnlyOption = editorRef.current.getOption('readOnly');
			console.log('✅ 获取选项成功:', readOnlyOption);
			
			setTestResult('✅ 基本功能测试通过');
			
		} catch (error) {
			const msg = `❌ 测试失败: ${error}`;
			console.error(msg);
			setTestResult(msg);
		}
	};

	// 测试装饰器功能
	const testDecorations = () => {
		console.log('🎨 开始测试装饰器功能...');
		
		if (!editorRef.current) {
			console.log('❌ Editor 引用为空');
			return;
		}

		try {
			// 注入样式
			const styleId = 'monaco-test-style';
			if (!document.getElementById(styleId)) {
				const style = document.createElement('style');
				style.id = styleId;
				style.textContent = `
					.monaco-test-decoration {
						background-color: #ff0000 !important;
						color: white !important;
					}
				`;
				document.head.appendChild(style);
				console.log('✅ 样式注入成功');
			}

			// 尝试添加装饰器
			const decorations = editorRef.current.deltaDecorations([], [{
				range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 20 },
				options: {
					inlineClassName: 'monaco-test-decoration',
					hoverMessage: { value: '这是测试装饰器' }
				}
			}]);
			
			console.log('✅ 装饰器应用成功:', decorations);
			setTestResult('✅ 装饰器测试通过');
			
		} catch (error) {
			const msg = `❌ 装饰器测试失败: ${error}`;
			console.error(msg);
			setTestResult(msg);
		}
	};

	const handleEditorDidMount = (editor: any, monaco: any) => {
		console.log('🚀 Monaco Editor 挂载成功');
		console.log('📚 Monaco 对象:', monaco);
		console.log('🔧 Editor 实例:', editor);
		
		editorRef.current = editor;
		setIsEditorReady(true);
		
		// 延迟测试
		setTimeout(() => {
			testBasicFeatures();
			setTimeout(testDecorations, 1000);
		}, 500);
	};

	const handleEditorChange = (value?: string) => {
		if (value === undefined) return;
		console.log('📝 编辑器内容变化:', value.substring(0, 50));
		onChange(value);
	};

	useEffect(() => {
		console.log('🔄 组件挂载，编辑器状态:', isEditorReady);
	}, [isEditorReady]);

	return (
		<div className="relative w-full h-full">
			{/* 调试面板 */}
			<div className="absolute top-2 left-2 z-20 bg-blue-100 border border-blue-300 rounded p-3 text-xs max-w-xs">
				<div className="font-bold mb-2">Monaco Editor 测试</div>
				<div>状态: {isEditorReady ? '✅ 已就绪' : '⏳ 加载中'}</div>
				<div className="mt-2 text-xs break-words">{testResult}</div>
				<div className="mt-2 flex gap-1">
					<button 
						onClick={testBasicFeatures}
						className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
					>
						测试基本功能
					</button>
					<button 
						onClick={testDecorations}
						className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
					>
						测试装饰器
					</button>
				</div>
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
