/* eslint-disable @typescript-eslint/no-explicit-any */
export function installSuggestHitband(editor: any) {
  try {
    if ((editor as any).__hitbandInstalled) return;
    (editor as any).__hitbandInstalled = true;

    const EXPAND_ZONE = 100; // 右侧意图展开带宽度（px）

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
      {
        id: 'ck-suggest-hud-style',
        css: `
          #ck-suggest-hud {
            position: fixed;
            top: 4px;
            right: 4px;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-size: 12px;
            padding: 2px 4px;
            white-space: pre;
            pointer-events: none;
            z-index: 10000;
          }
        `,
      },
    ]);

    const HUD_ID = 'ck-suggest-hud';
    const ensureHud = () => {
      let hud = document.getElementById(HUD_ID) as HTMLElement | null;
      if (!hud) {
        hud = document.createElement('div');
        hud.id = HUD_ID;
        document.body.appendChild(hud);
      }
      return hud;
    };

    const hud = ensureHud();
    const updateHud = () => {
      const widget = document.querySelector('.suggest-widget') as HTMLElement | null;
      const detail = widget?.querySelector('.detail') as HTMLElement | null;
      if (widget && isSuggestVisible()) {
        const st = detail ? window.getComputedStyle(detail) : null;
        hud.style.display = 'block';
        hud.textContent = `.suggest-widget: ${widget.className}\n` +
          `detail ws:${st?.whiteSpace} ov:${st?.overflow} to:${st?.textOverflow}`;
      } else {
        hud.style.display = 'none';
      }
      requestAnimationFrame(updateHud);
    };
    updateHud();

    const setAllRowsIdle = () => {
      const rows = qsa<HTMLElement>('.suggest-widget.visible .monaco-list-row');
      for (const row of rows) {
        row.classList.add('ck-idle');
        row.classList.remove('ck-intent-expand');
      }
    };

    const onMouseMoveCapture = (ev: MouseEvent) => {
      if (!isSuggestVisible()) return;
      const rows = qsa<HTMLElement>('.suggest-widget.visible .monaco-list-row');
      if (!rows.length) return;

      setAllRowsIdle();

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

    const onListMouseLeave = () => {
      setAllRowsIdle();
      (document.body.style as any).cursor = '';
    };

    let boundList: HTMLElement | null = null;
    const wireList = () => {
      const list = document.querySelector('.suggest-widget.visible .monaco-list');
      if (!list || list === boundList) return;
      boundList = list as HTMLElement;
      boundList.addEventListener('mousemove', onMouseMoveCapture, true);
      boundList.addEventListener('mouseleave', onListMouseLeave, true);
      setAllRowsIdle();
    };

    wireList();
    const ctrl = editor?.getContribution?.('editor.contrib.suggestController');
    const widget = ctrl?._widget?.value;
    widget?.onDidShow?.(() => setTimeout(wireList, 0));

    editor?.onDidDispose?.(() => {
      boundList?.removeEventListener('mousemove', onMouseMoveCapture, true);
      boundList?.removeEventListener('mouseleave', onListMouseLeave, true);
      boundList = null;
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
