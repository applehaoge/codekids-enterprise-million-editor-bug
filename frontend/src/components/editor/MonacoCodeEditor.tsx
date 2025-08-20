import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './editor-height-chain.css';
import { codeCompletions, CHILD_HINTS } from '@/data/editorMock';

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
	theme = 'vs',
	onError,
	onSave,
	readOnly = false,
}: MonacoCodeEditorProps) {
	const editorRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const providerRef = useRef<any>(null);

	// 编辑器挂载 - 最小化测试版本
	const handleEditorDidMount = (editor: any, monaco: any) => {
		console.log('🚀 Monaco Editor mounted successfully');
		console.log('Editor instance:', editor);
		console.log('Monaco object:', monaco);
		
		editorRef.current = editor;

		// 不在 onMount 末尾 dispose provider（防止立即卸载）

		const provider = monaco.languages.registerCompletionItemProvider(language, {
			triggerCharacters: ['.', '(', '"', "'"],
			provideCompletionItems: (model: any, position: any) => {
				console.debug('[completion] hit');
				const word = model.getWordUntilPosition(position);
				const range = {
					startLineNumber: position.lineNumber,
					endLineNumber: position.lineNumber,
					startColumn: word.startColumn,
					endColumn: word.endColumn,
				};
				try {
					const suggestions: any[] = [];
					const aliasFilterMap: Record<string, string> = {
						'for-range': 'f for for-range range',
						'for-enumerate': 'f for enumerate for-enumerate',
						'while': 'w while',
						'__main__': 'm main __main__',
						'class': 'c class',
						'with-open-read': 'w with open read',
						'list-comp': 'l list comp []',
						'pygame-init': 'p pygame init',
					};
					const makeFilterText = (item: any, alias: string) => {
						if (alias && aliasFilterMap[alias]) return aliasFilterMap[alias];
						const parts: string[] = [];
						if (alias) parts.push(alias);
						if (item.keyword) parts.push(String(item.keyword));
						if (item.description) parts.push(String(item.description).split(/\s+/).slice(0,6).join(' '));
						if (alias && alias.length > 0) parts.push(alias[0]);
						if (item.keyword && String(item.keyword).length > 0) parts.push(String(item.keyword)[0]);
						return parts.join(' ').replace(/\s+/g, ' ').trim();
					};
					for (const group of codeCompletions) {
						for (const item of group.items) {
							const isSnippet = item.snippet === true || item.type === 'snippet';
							const alias = (item.translation && String(item.translation)) || String(item.keyword);
							if (isSnippet) {
								suggestions.push({
									label: alias,
									detail: item.description,
									documentation: item.description + (item.translation ? ' — ' + item.translation : ''),
									filterText: makeFilterText(item, alias),
									sortText: '0_' + alias,
									kind: monaco.languages.CompletionItemKind.Snippet,
									insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
									insertText: item.keyword,
									range,
								});
							} else {
								const label = String(item.keyword);
								suggestions.push({
									label,
									detail: item.description,
									documentation: item.description + (item.translation ? ' — ' + item.translation : ''),
									filterText: makeFilterText(item, label),
									sortText: '1_' + label,
									kind: monaco.languages.CompletionItemKind.Function,
									insertText: item.keyword,
									range,
								});
								if (label === 'for') {
									suggestions.push({
										label: 'for',
										kind: monaco.languages.CompletionItemKind.Keyword,
										insertText: 'for ',
										filterText: 'f for',
										sortText: '0_for',
										range,
									});
								}
							}
						}
					}
					return { suggestions };
				} catch (e) {
					console.error('completion provider error', e);
					return { suggestions: [] };
				}
				/*
				const suggestions: any[] = [];
				for (const group of codeCompletions) {
					for (const item of group.items) {
						const isSnippet = item.snippet === true || item.type === 'snippet';
						if (isSnippet) {
							suggestions.push({
							label: item.keyword,
							kind: monaco.languages.CompletionItemKind.Snippet,
							documentation: item.description + (item.translation ? ' — ' + item.translation : ''),
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							insertText: item.keyword,
							range,
						});
						} else {
							suggestions.push({
							label: item.keyword,
							kind: monaco.languages.CompletionItemKind.Function,
							documentation: item.description + (item.translation ? ' — ' + item.translation : ''),
							insertText: item.keyword,
							range,
						});
						}
					}
				}
				return { suggestions };
				*/
			},
		});
		providerRef.current = provider;

		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			onSave?.();
		});

		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			console.log('📝 Content changed:', value.substring(0, 50));
			onChange(value);
		});


		try {
			const monacoNode = containerRef.current ? containerRef.current.querySelector('.monaco-editor') : null;
			if (monacoNode) {
				let node = monacoNode as HTMLElement | null;
				for (let i = 0; i < 6 && node; i++) {
					const cls = node.className || node.tagName;
					const offsetH = node.offsetHeight;
					const style = window.getComputedStyle(node);
					const computedHeight = style.height;
					const maxHeight = style.maxHeight;
					const flex = style.flex || style.flexGrow + '/' + style.flexShrink + '/' + style.flexBasis;
					const overflow = style.overflow;
					console.log(`HEIGHT_CHAIN level ${i}:`, { className: cls, offsetHeight, computedHeight, maxHeight, flex, overflow });
					if (offsetH === 0 || computedHeight === '0px' || computedHeight === 'auto' || (maxHeight && maxHeight !== 'none' && parseFloat(maxHeight) > 0 && parseFloat(maxHeight) < 10)) {
						console.warn('HEIGHT_CHAIN anomaly at level', i, { className: cls, offsetHeight, computedHeight, maxHeight, flex });
						break;
					}
					node = node.parentElement;
				}
			} else {
				console.warn('HEIGHT_CHAIN: .monaco-editor node not found inside containerRef');
			}
		} catch (e) {
			console.error('HEIGHT_CHAIN traversal error', e);
		}

		// 强制 layout：有时容器首次不可见导致高度为 0，记录布局前后尺寸
		try {
			const beforeH = containerRef.current ? containerRef.current.clientHeight : null;
			console.log('🔍 editor mount - container height before layout:', beforeH);
			if (editor && typeof editor.layout === 'function') {
				setTimeout(() => {
					editor.layout();
					const afterH = containerRef.current ? containerRef.current.clientHeight : null;
					console.log('🔍 editor mount - container height after layout:', afterH);
					console.log('ℹ️ Forced editor.layout() after mount');
				}, 50);
			}
		} catch (e) {
			console.error('layout error', e);
		}

		// 在编辑器被销毁时清理 provider
		editor.onDidDispose(() => {
			try { providerRef.current && providerRef.current.dispose && providerRef.current.dispose(); } catch (e) { /* ignore */ }
			providerRef.current = null;
		});

		try {
			editor.trigger && typeof editor.trigger === 'function' && editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
		} catch (e) {
			console.warn('triggerSuggest failed', e);
		}

		console.log('🎯 Editor ready for testing!');
	};

	const handleEditorChange = (value?: string) => {
		if (value !== undefined) {
			onChange(value);
		}
	};

	useEffect(()=>{
		const onResize = () => {
			if (editorRef.current && typeof editorRef.current.layout === 'function') {
				editorRef.current.layout();
				console.log('ℹ️ editor.layout() on window resize');
			}
		};
		window.addEventListener('resize', onResize);

		// ResizeObserver：监测容器尺寸变化并触发 layout
		let ro: ResizeObserver | null = null;
		try {
			if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
				ro = new ResizeObserver((entries) => {
					for (const entry of entries) {
						const h = entry.contentRect.height;
						console.log('🔍 ResizeObserver container height:', h);
						if (editorRef.current && typeof editorRef.current.layout === 'function') {
							editorRef.current.layout();
							console.log('ℹ️ on ResizeObserver layout');
						}
					}
				});
				ro.observe(containerRef.current);
				console.log('🔍 ResizeObserver attached to editor container');
			}
		} catch (e) {
			console.error('ResizeObserver setup failed', e);
		}

		return ()=>{
			window.removeEventListener('resize', onResize);
			if (ro) ro.disconnect();
		};
	},[]);

	return (
		<div ref={containerRef} className="relative w-full h-full editor-height-chain" id="editor-container" style={{ minHeight: '400px', height: '100%', zIndex: 10 }}>
			{/* 调试信息 */}
			<div className="hidden debug-card" aria-hidden="true">
				<div>Monaco Editor - 最小化测试版本</div>
				<div>检查控制台日志</div>
			</div>

			<div className="editor-height-chain editor-host-inner" style={{height: '100%'}}>
				<Editor
					height="100%"
					language={language}
					theme={theme}
					value={code}
					onChange={handleEditorChange}
					beforeMount={async (monaco) => {
						try {
							await import('monaco-editor/esm/vs/basic-languages/python/python.contribution');
							console.log('✅ python.contribution loaded');
						} catch (e) {
							console.warn('加载 python.contribution 失败', e);
						}
					}}
					onMount={handleEditorDidMount}
					options={{
						lineNumbersMinChars: 2,
						glyphMargin: false,
						folding: false,
						lineDecorationsWidth: 0,
							lineNumbersMinChars: 2,
						// 基本配置
						readOnly,
						fontSize: 16,
						wordWrap: 'on',
						automaticLayout: true,
						
						// 编辑器显示
						minimap: { enabled: false },
						lineNumbers: 'on',
						glyphMargin: true,
						folding: true,
						lineDecorationsWidth: 10,
						
						// 渲染设置
						renderLineHighlight: 'line',
						scrollBeyondLastLine: false,
						renderValidationDecorations: 'on',
						overviewRulerBorder: true,
						hideCursorInOverviewRuler: false,
						overviewRulerLanes: 3,
						renderWhitespace: 'selection',
						renderControlCharacters: true,
						renderLineHighlightOnlyWhenFocus: false,
						
						// 交互功能
						contextmenu: true,
						quickSuggestions: { other: true, strings: true, comments: false },
						suggestOnTriggerCharacters: true,
						acceptSuggestionOnEnter: 'on',
						tabCompletion: 'on',
						wordBasedSuggestions: true,
						parameterHints: { enabled: true },
						hover: { enabled: true },
						links: true,
						colorDecorators: true,
					}}
				/>
			</div>
		</div>
	);
}
