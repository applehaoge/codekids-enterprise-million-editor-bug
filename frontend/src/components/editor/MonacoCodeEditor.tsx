import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './editor-height-chain.css';
import { codeCompletions } from '@/data/editorMock';

// 初学阶段隐藏片段，后续把 false 改 true 即解锁
const SHOW_SNIPPETS = false;

// 去掉 ${1:xxx}/${2} 这类占位符
const stripSnippetVars = (s = "") =>
  s.replace(/\$\{\d+:?[^}]*\}/g, "").replace(/\$\d+/g, "");

// 把函数参数压成 (...)
const compressSignature = (s = "") => s.replace(/\([^)]*\)/g, "(...)");

// 从 translation 或 CHILD_HINTS 兜底中文；key 用英文首词
const getZh = (item: any, enStripped: string) => {
  const keyForHint =
    (item.key && String(item.key)) || (enStripped.split(/\s+/)[0] || "");
  const zh =
    (typeof item.translation === "string" && item.translation.trim()) || "";
  return zh || (CHILD_HINTS?.[keyForHint] || "");
};

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
					const defaultExamples: Record<string, string> = {
					"print": "print(\"你好\")",
					"len": "len([1,2,3])",
					".append()": "nums = [1,2]\nnums.append(3)\nprint(nums)  # [1,2,3]",
					"for": "for i in range(3):\n    print(i)",
				};

				const makeDocumentation = (item: any) => {
					let exampleStr = '';
					if (typeof item?.example === 'string' && item.example.trim().length > 0) {
						exampleStr = item.example;
					} else {
						const key = String(item?.keyword || '').trim();
						if (defaultExamples[key]) exampleStr = defaultExamples[key];
					}
					if (!exampleStr) return { value: "" };

					// 去掉每行前导空白，避免缩进
					const lines = exampleStr
						.replace(/\t/g, ' ')
						.split(/\r?\n/)
						.map(s => s.replace(/^\s+/, ''))
						.filter(s => s.length > 0);

					// 转义行内 HTML 符号，避免被当作标签渲染
					const escape = (s: string) =>
						s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

					const html = "使用示例：<br/><br/>" + lines.map(escape).join("<br/>");

					// 关键：IMarkdownString，允许 HTML 换行
					return { value: html, isTrusted: true, supportHtml: true };
				};

				const customLabels = new Set<string>();
					for (const group of codeCompletions) {
						for (const item of group.items) {
							const isSnippet = item.snippet === true || item.type === 'snippet';
							if (isSnippet && !SHOW_SNIPPETS) { continue; }
							const alias = String(item.keyword || item.key || "");
							const enOriginal = String(item.keyword || item.label || item.key || "");
							const enStripped = stripSnippetVars(enOriginal);
							const zh = getZh(item, enStripped);
							const enShort = compressSignature(enStripped).trim();
							let label = (zh ? zh + " " : "") + enShort;
							if (label.length > 28) label = label.slice(0, 27) + "…";
							const shortDetail = (item.description && String(item.description).trim())
								? (String(item.description).trim().slice(0, 26) + (String(item.description).trim().length > 26 ? "…" : ""))
								: "";
							customLabels.add(String(alias));
							suggestions.push({
								label,
								detail: shortDetail,
								documentation: makeDocumentation(item),
								filterText: [zh, enStripped, alias].filter(Boolean).join(" "),
								sortText: '1_' + enStripped,
								kind: monaco.languages.CompletionItemKind.Function,
								insertText: item.keyword,
								range,
							});
							}
						}
					const deduped: any[] = [];
					const seen = new Set<string>();
					for (const s of suggestions) {
						const key = String(s.label);
						if (!seen.has(key)) {
							deduped.push(s);
							seen.add(key);
						}
					}
					return { suggestions: deduped };
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
							documentation: makeDocumentation(item),
							insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
							insertText: item.keyword,
							range,
						});
						} else {
							suggestions.push({
							label: item.keyword,
							kind: monaco.languages.CompletionItemKind.Function,
							documentation: makeDocumentation(item),
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

		// disable builtin keyword suggestions so our CN completions dominate
		try {
			editor.updateOptions({
				suggest: { showKeywords: false, showSnippets: true, showWords: true },
				wordBasedSuggestions: 'currentDocument'
			});
		} catch (e) { /* ignore if unsupported */ }

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
						// 基本配置
						readOnly,
						fontSize: 16,
						wordWrap: 'on',
						automaticLayout: true,
						// 编辑器显示
						minimap: { enabled: false },
						lineNumbers: 'on',
						lineNumbersMinChars: 2,
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
