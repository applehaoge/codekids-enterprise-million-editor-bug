import React, { useRef } from 'react';
import CodeEditorMonaco from './CodeEditorMonaco';
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
			// 临时调试用：把编辑器实例暴露给窗口，便于控制台调用
			;(window as any).__ed = editor;
		
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
			const el = (editor as any)?.getDomNode?.();
			const h = (el as HTMLElement | null)?.offsetHeight;
			if (!h) {
				console.warn('HEIGHT_CHAIN: offsetHeight not available, skip once');
			} else {
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

		// 调用补丁（尝试）
		try { installMonacoSuggestPatches(editor, monaco); } catch (e) { console.warn('install patch failed', e); }

		console.log('🎯 Editor ready for testing!');
		try {
			import('./monaco/suggestHitband').then(({ installSuggestHitband }) => installSuggestHitband(editor)).catch((e) => console.warn('installSuggestHitband import failed', e));
		} catch (e) { console.warn('installSuggestHitband failed', e); }
	};

	const handleEditorChange = (value?: string) => {
		if (value !== undefined) {
			onChange(value);
		}
	};

        return (
                <div
                        ref={containerRef}
                        className="relative w-full editor-height-chain editor-wrapper"
                        id="editor-container"
                        style={{ minHeight: '400px', zIndex: 10 }}
                >
                        {/* 调试信息 */}
			<div className="hidden debug-card" aria-hidden="true">
				<div>Monaco Editor - 最小化测试版本</div>
				<div>检查控制台日志</div>
			</div>

			<div className="editor-height-chain editor-host-inner" style={{height: '100%'}}>
				<CodeEditorMonaco
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

			{/* 临时测试：新版 Monaco 容器 */}
			<div style={{ height: 300, border: "1px dashed gray", marginTop: 12 }}>
				<CodeEditorMonaco />
			</div>
		</div>
	);
}

function installMonacoSuggestPatches(
  editor: any,
  monacoNS?: any
) {
  try {
    if ((editor as any).__patchInstalled) return;
    (editor as any).__patchInstalled = true;

    // 可调参数
    const ARROW_GAP = 6;              // 箭头几何判定间隙（像素），0~12可微调
    const sugDebug = (window as any).__sugDebug === true;  // 控制台开关

    // ---------- 清理旧样式（与控制台脚本一致） ----------
    try {
      ['suggest-details-pointer-guard','details-pointer-filter','kill-details']
        .forEach(id => document.getElementById(id)?.remove());
    } catch {}

    // ---------- 仅注入"精确放行样式"（与控制台脚本一致） ----------
    injectStylesOnce([
      {
        id: 'suggest-details-precise-guard',
        css: `
          /* 避免被裁剪 */
          .monaco-editor .suggest-widget { overflow: visible; }

          /* 只禁用 details 正文的指针，保留 header/actions/图标/工具栏可点击 */
          .monaco-editor .suggest-widget .details { pointer-events: auto; }
          .monaco-editor .suggest-widget .details .body,
          .monaco-editor .suggest-widget .details .markdown-docs { pointer-events: none; }

          .monaco-editor .suggest-widget .details .header,
          .monaco-editor .suggest-widget .details .actions,
          .monaco-editor .suggest-widget .details .codicon,
          .monaco-editor .suggest-widget .details .monaco-button,
          .monaco-editor .suggest-widget .monaco-action-bar,
          .monaco-editor .suggest-widget .monaco-toolbar { pointer-events: auto; }
        `,
      },
    ]);

    // ---------- Controllers & helpers ----------
    // 惰性获取 suggestController：首次可能为 null，不能因此提前 return
    const getCtrl = () => {
      try {
        const c = editor.getContribution && editor.getContribution('editor.contrib.suggestController');
        if (c && !(window as any).__ctrl) { try { (window as any).__ctrl = c; } catch {} }
        return c || (window as any).__ctrl;
      } catch { return (window as any).__ctrl; }
    };

    const getWidget = () => {
      const c: any = getCtrl();
      return c?.widget?.value || c?._widget?.value;
    };
    const getRoot = (): HTMLElement | null =>
      (document.querySelector('.monaco-editor .suggest-widget') as HTMLElement | null);
    const getList = (): any => {
      const w = getWidget();
      return (w as any)?._list || (w as any)?.list || (w as any)?.listWidget || (w as any)?._widget?.list;
    };

    const sugState = { inDetails: false };

    // Bind all listeners on current widget instance
    const wireAll = () => {
      // 不再依赖 root 绑定；改为 document 捕获委托（见下）
      wireDocCaptureOnce();
      // 可选：如果你还需要悬停/点击行逻辑，保留
      wireRowsHoverV2();
    };

    // Initial bind + rebind on widget show（仅重绑）
    wireAll();
    const w = getWidget();
    w?.onDidShow?.(() => {
      setTimeout(wireAll, 0);
      requestAnimationFrame(wireAll);
    });
    // 如果一开始 ctrl 取不到，先手动触发一次 suggest，促使 controller 加载
    try { editor?.trigger?.('keyboard', 'editor.action.triggerSuggest', {}); } catch {}

    // (已删除) MutationObserver / 全局 mousedown / 几何判定 / 吞 mouseup/click / 粘住展开

    // ---------- Details click fix（与控制台脚本同路径）：document 捕获委托 ----------
    function wireDocCaptureOnce() {
      if ((window as any).__sugDocArrowBound) return;

      // 与控制台一致的“箭头/动作区”选择器
      const isArrowOrActions = (el: Element | null) =>
        !!(el as HTMLElement | null)?.closest?.(
          '.codicon, .monaco-button, .action-item, .actions, .monaco-action-bar'
        );

      const onDocMouseDown = (ev: MouseEvent) => {
        // 观测探针：记录最近一次捕获到的事件
        (window as any).__sugLastEvt = { t: Date.now(), type: ev.type };
        const root = getRoot();
        if (!root) return;
        const target = ev.target as Element | null;
        if (!target || !root.contains(target)) return;
        if (!isArrowOrActions(target)) return;

        // 仅“显示”以避免松手被内置 toggle 关闭；并彻底阻断事件
        try { const c: any = getCtrl(); if (c?.toggleDetails) c.toggleDetails(); else c?.showDetails?.(true); } catch {}
        try { ev.preventDefault(); } catch {}
        try { ev.stopPropagation(); } catch {}
        try { (ev as any).stopImmediatePropagation?.(); } catch {}
        ;(window as any).__sugFired = ((window as any).__sugFired|0) + 1;
      };

      // 把 handler 和安装位暴露到全局，便于你在控制台自检
      (window as any).__sugDocArrowHandler = onDocMouseDown;
      const opts: AddEventListenerOptions = { capture: true, passive: false };

      // 多目标安装，规避某些环境下 document 不冒泡/被代理的问题
      document.addEventListener('mousedown', onDocMouseDown, opts);
      window.addEventListener('mousedown', onDocMouseDown, opts as any);
      document.body?.addEventListener?.('mousedown', onDocMouseDown, opts);

      (window as any).__sugDocArrowBound = true;

      // 提供一个可见的自检接口
      (window as any).__sugDocInfo = () => ({
        bound: !!(window as any).__sugDocArrowBound,
        handlerType: typeof (window as any).__sugDocArrowHandler,
        fired: (window as any).__sugFired|0
      });
    }

    // ---------- Hover / 标记逻辑可保留或删除；不影响箭头点击 ----------
    function wireDetailsHoverMark(root: HTMLElement) {
      if ((root as any).__detailsHoverBound) return;

      const isActionsRegion = (el: Element | null) =>
        !!(el as HTMLElement | null)?.closest?.(
          '.suggest-widget .details .actions, \
           .suggest-widget .details .header, \
           .suggest-widget .monaco-action-bar, \
           .suggest-widget .monaco-toolbar, \
           .suggest-widget .details .codicon, \
           .suggest-widget .details .monaco-button'
        );

      const onOver = (ev: MouseEvent) => {
        const t = ev.target as Element | null;
        if (isActionsRegion(t)) sugState.inDetails = true;
      };
      const onOut = (ev: MouseEvent) => {
        const related = ev.relatedTarget as Node | null;
        if (!related || !root.contains(related)) {
          sugState.inDetails = false;
        }
      };

      root.addEventListener('mouseover', onOver as any, true);
      root.addEventListener('mouseout', onOut as any, true);

      (root as any).__detailsHoverBound = true;
    }

    // ---------- Hover V2 on rows（保持现状，不动） ----------
    function wireRowsHoverV2() {
      const rows = document.querySelector('.suggest-widget .monaco-list-rows') as HTMLElement | null;
      if (!rows || (rows as any).__hoverBound) return;

      let raf = 0;
      const onMove = (ev: MouseEvent) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const row = (ev.target as HTMLElement)?.closest?.('.monaco-list-row') as HTMLElement | null;
          if (!row) return;
          const idx = Array.prototype.indexOf.call(rows.children, row);
          if (idx >= 0) (getList() as any)?.setFocus?.([idx]); // focus only
        });
      };

      const onDown = (ev: MouseEvent) => {
        if (sugState.inDetails) return;
        const row = (ev.target as HTMLElement)?.closest?.('.monaco-list-row') as HTMLElement | null;
        if (!row) return;
        const idx = Array.prototype.indexOf.call(rows.children, row);
        if (idx >= 0) {
          const list: any = getList();
          list?.setFocus?.([idx]);
          list?.setSelection?.([idx]);
          if ((editor as any)?.trigger) {
            (editor as any).trigger('mouse', 'acceptSelectedSuggestion', {});
          } else {
            try { (ctrl as any)?.acceptSelectedSuggestion?.(); } catch {}
          }
          ev.preventDefault();
          ev.stopPropagation();
        }
      };

      rows.addEventListener('mousemove', onMove, { capture: true });
      rows.addEventListener('mousedown', onDown, { capture: true });
      (rows as any).__hoverBound = true;
    }

  } catch (e) {
    console.warn('installMonacoSuggestPatches failed', e);
  }
}

// Helper: inject multiple <style> tags only once
function injectStylesOnce(items: Array<{ id: string; css: string }>) {
  items.forEach(({ id, css }) => {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.documentElement.appendChild(style);
  });
}
