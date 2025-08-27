/* eslint-disable @typescript-eslint/no-explicit-any */
export function installSuggestHitband(editor: any) {
  try {
    if ((editor as any).__hitbandInstalled) return;
    (editor as any).__hitbandInstalled = true;

    // ==== 可调参数 ====
    const LEFT_BAND  = 100;  // 左侧命中带宽度（px）
    const EXPAND_ZONE = 100; // 右侧意图展开带宽度（px）
    const RIGHT_BAND = EXPAND_ZONE; // 右侧命中带宽度（px）
    const CLICK_DEBOUNCE_MS = 500; // 防抖时间，避免展开后立即被第二次点击收回

    // ==== 工具函数 ====
    const qsa = <T extends Element = HTMLElement>(sel: string) =>
      Array.from(document.querySelectorAll(sel)) as T[];

    const isSuggestVisible = () => !!document.querySelector('.suggest-widget.visible');

    injectStylesOnce([
      {
        id: 'hitband-style',
        css: `
          .suggest-widget .monaco-list-row.ck-idle .readMore.codicon.codicon-suggest-more-info {
            opacity: 0;
            pointer-events: none;
            transition: opacity .12s ease;
          }
          .suggest-widget .monaco-list-row.ck-intent-expand .readMore.codicon.codicon-suggest-more-info {
            opacity: 1;
            pointer-events: auto;
          }
          .suggest-widget .monaco-list-row.ck-idle .detail {
            white-space: normal;
            overflow: hidden;
            text-overflow: initial;
            max-height: 8em;
          }
          .suggest-widget .monaco-list-row.ck-intent-expand .detail {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-height: 1.4em;
          }
        `,
      },
    ]);

    // ==== 仅展示箭头的 hover 提示（不改变点击逻辑）====
    const onMouseMoveCapture = (ev: MouseEvent) => {
      if (!isSuggestVisible()) return;
      const rows = qsa<HTMLElement>('.suggest-widget.visible .monaco-list-row');
      if (!rows.length) return;

      for (const row of rows) {
        row.classList.add('ck-idle');
        row.classList.remove('ck-intent-expand');
      }

      const listRect = rows[0].closest('.monaco-list')?.getBoundingClientRect();
      if (!listRect) return;

      const x = ev.clientX;
      const inRightZone = x >= listRect.right - EXPAND_ZONE && x <= listRect.right;
      if (!inRightZone) {
        (document.body.style as any).cursor = '';
        return;
      }

      for (const row of rows) {
        const rowRect = row.getBoundingClientRect();
        const inY = ev.clientY >= rowRect.top && ev.clientY <= rowRect.bottom;
        if (inY) {
          row.classList.remove('ck-idle');
          row.classList.add('ck-intent-expand');
          (document.body.style as any).cursor = 'pointer';
          break;
        }
      }
    };

    const onListMouseLeave = (ev: MouseEvent) => {
      const list = document.querySelector('.suggest-widget.visible .monaco-list');
      if (!list) return;
      if (ev.target !== list) return;
      const rows = qsa<HTMLElement>('.suggest-widget.visible .monaco-list-row');
      for (const row of rows) {
        row.classList.add('ck-idle');
        row.classList.remove('ck-intent-expand');
      }
      (document.body.style as any).cursor = '';
    };

    // ==== 左右命中带点击：模拟点击该行的小箭头 ====
    let lastClickTime = 0;
    const onMouseDownCapture = (ev: MouseEvent) => {
      if (!isSuggestVisible()) return;
      const rows = qsa<HTMLElement>('.suggest-widget.visible .monaco-list-row');
      if (!rows.length) return;

      for (const row of rows) {
        const rowRect = row.getBoundingClientRect();
        const listRect = row.closest('.monaco-list')?.getBoundingClientRect();
        if (!listRect) continue;

        const inY = ev.clientY >= rowRect.top && ev.clientY <= rowRect.bottom;
        if (!inY) continue;

        const x = ev.clientX;
        const inLeft  = x >= listRect.left && x <= listRect.left + LEFT_BAND;
        const inRight = x >= listRect.right - RIGHT_BAND && x <= listRect.right;

        // 仅当命中左右带时，拦截并处理
        if (inLeft || inRight) {
          // 阻断默认插入/冒泡
          ev.preventDefault();
          ev.stopPropagation();
          (ev as any).stopImmediatePropagation?.();

          // 可视化闪烁，便于肉眼确认命中
          const prevOutline = row.style.outline;
          row.style.outline = '1px solid red';
          setTimeout(() => (row.style.outline = prevOutline), 120);

          const now = Date.now();
          if (now - lastClickTime < CLICK_DEBOUNCE_MS) return; // 防抖
          lastClickTime = now;

          // 对齐焦点/选中
          const ctrl = editor?.getContribution?.('editor.contrib.suggestController');
          const list = ctrl?._widget?.value?._list;
          const idx = rows.indexOf(row);
          list?.setFocus?.([idx]);
          list?.setSelection?.([idx]);

          // 精确定位箭头并模拟完整点击
          const arrow = row.querySelector('.readMore.codicon.codicon-suggest-more-info') as HTMLElement | null;
          if (arrow) {
            const rect = arrow.getBoundingClientRect();
            const ax = rect.left + rect.width / 2;
            const ay = rect.top + rect.height / 2;

            const fire = (type: string, props: any = {}) => {
              const evObj = type.startsWith('pointer')
                ? new PointerEvent(type, {
                    bubbles: true, cancelable: true,
                    clientX: ax, clientY: ay,
                    pointerId: 1, pointerType: 'mouse', isPrimary: true,
                    ...props,
                  })
                : new MouseEvent(type, {
                    bubbles: true, cancelable: true,
                    clientX: ax, clientY: ay, ...props,
                  });
              arrow.dispatchEvent(evObj);
            };

            // 标准序列：pointerdown → pointerup → mouseup → click
            fire('pointerdown', { button: 0, buttons: 1 });
            fire('pointerup',   { button: 0, buttons: 0 });
            fire('mouseup',     { button: 0, buttons: 0 });
            fire('click',       { button: 0, buttons: 0 });

            console.log('[hitband] simulated arrow click', { idx });
          } else {
            console.warn('[hitband] arrow not found', idx);
          }

          return; // 命中一行后处理完毕
        }
      }
    };

    // ==== 点击编辑器空白处关闭补全 ====
    const onDocDownCloseSuggest = (ev: MouseEvent) => {
      if (!isSuggestVisible()) return;
      const widget = document.querySelector('.suggest-widget.visible') as HTMLElement | null;
      if (!widget) return;

      const target = ev.target as Node | null;
      const insideWidget = !!(target && widget.contains(target));
      if (insideWidget) return; // 点补全内：不处理

      // 让当前点击先完成（例如移动光标），下一帧发送 ESC 关闭补全
      setTimeout(() => {
        try {
          editor?.trigger?.('keyboard', 'escape', {});
        } catch {}
      }, 0);
    };

    // ==== 监听安装 ====
    document.addEventListener('mousemove', onMouseMoveCapture, true);
    document.addEventListener('mouseleave', onListMouseLeave, true);
    document.addEventListener('mousedown', onMouseDownCapture, true);
    document.addEventListener('mousedown', onDocDownCloseSuggest, true);

    // ==== 卸载清理 ====
    editor?.onDidDispose?.(() => {
      document.removeEventListener('mousemove', onMouseMoveCapture, true);
      document.removeEventListener('mouseleave', onListMouseLeave, true);
      document.removeEventListener('mousedown', onMouseDownCapture, true);
      document.removeEventListener('mousedown', onDocDownCloseSuggest, true);
      (document.body.style as any).cursor = '';
    });

    console.log('✅ suggestHitband installed');
  } catch (e) {
    console.warn('installSuggestHitband failed', e);
  }
}

function injectStylesOnce(items: Array<{ id: string; css: string }>) {
  items.forEach(({ id, css }) => {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.documentElement.appendChild(style);
  });
}
