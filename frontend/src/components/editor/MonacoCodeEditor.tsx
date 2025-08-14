import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
  const [chineseSymbols, setChineseSymbols] = useState<Array<{line: number, column: number, symbol: string}>>([]);

  // 中文符号检测
  const detectChineseSymbols = (code: string) => {
    const chineseSymbolMap: { [key: string]: string } = {
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

    const symbols: Array<{line: number, column: number, symbol: string}> = [];
    const lines = code.split('\n');

    lines.forEach((line, lineIndex) => {
      line.split('').forEach((char, charIndex) => {
        if (chineseSymbolMap[char]) {
          symbols.push({
            line: lineIndex + 1,
            column: charIndex + 1,
            symbol: char,
          });
        }
      });
    });

    setChineseSymbols(symbols);
    return symbols;
  };

  // 自动修复中文符号
  const fixChineseSymbols = () => {
    if (chineseSymbols.length === 0) return;

    const chineseSymbolMap: { [key: string]: string } = {
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

    let fixedCode = code;
    chineseSymbols.forEach(({ symbol }) => {
      fixedCode = fixedCode.replace(new RegExp(symbol, 'g'), chineseSymbolMap[symbol]);
    });

    onChange(fixedCode);
    toast.success(`已修复 ${chineseSymbols.length} 个中文符号`);
    setChineseSymbols([]);
  };

  // 点击替换单个中文符号
  const replaceSingleSymbol = (symbol: string, line: number, column: number) => {
    const chineseSymbolMap: { [key: string]: string } = {
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

    const replacement = chineseSymbolMap[symbol];
    if (!replacement) return;

    // 获取当前代码
    const currentCode = editorRef.current?.getValue() || code;
    const lines = currentCode.split('\n');
    
    // 替换指定位置的符号
    if (lines[line - 1]) {
      const lineContent = lines[line - 1];
      const newLineContent = lineContent.substring(0, column - 1) + replacement + lineContent.substring(column);
      lines[line - 1] = newLineContent;
      
      const newCode = lines.join('\n');
      onChange(newCode);
      
      // 更新光标位置
      if (editorRef.current) {
        const position = { lineNumber: line, column: column };
        editorRef.current.setPosition(position);
        editorRef.current.focus();
      }
      
      toast.success(`已将 "${symbol}" 替换为 "${replacement}"`);
    }
  };

  // 编辑器配置
  const editorOptions = {
    readOnly,
    minimap: { enabled: false },
    fontSize: 16,
    fontFamily: 'Consolas, "Courier New", monospace',
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    parameterHints: {
      enabled: true,
    },
    hover: {
      enabled: true,
    },
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,
    trimAutoWhitespace: true,
    largeFileOptimizations: true,
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showConstants: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showWords: true,
      showColors: true,
      showUserSnippets: true,
      showOther: true,
    },
  };

  // 处理编辑器挂载
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // 添加自定义快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    // 添加中文符号检测
    editor.onDidChangeModelContent(() => {
      const currentCode = editor.getValue();
      detectChineseSymbols(currentCode);
    });

    // 添加错误检测
    const model = editor.getModel();
    if (model) {
      monaco.editor.onDidChangeMarkers(([resource]) => {
        if (resource.toString() === model.uri.toString()) {
          const markers = monaco.editor.getModelMarkers({ resource });
          const errors = markers.filter(marker => marker.severity === monaco.MarkerSeverity.Error);
          if (errors.length > 0 && onError) {
            onError(errors[0].message);
          }
        }
      });
    }

    // 初始检测
    detectChineseSymbols(code);
  };

  // 处理代码变化
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
      detectChineseSymbols(value);
    }
  };

  // 监听 code 变化，重新检测
  useEffect(() => {
    if (isEditorReady) {
      detectChineseSymbols(code);
    }
  }, [code, isEditorReady]);

  return (
    <div className="relative w-full h-full">
      {/* 中文符号检测提示 */}
      {chineseSymbols.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-2 z-10 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-800 font-medium">检测到中文符号</span>
            <button
              onClick={fixChineseSymbols}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              一键修复全部
            </button>
          </div>
          <div className="text-sm text-yellow-700 mb-2">
            发现 {chineseSymbols.length} 个中文符号，建议修复为英文符号
          </div>
          <div className="text-xs text-yellow-600">
            💡 点击下方红色符号可单独替换
          </div>
        </motion.div>
      )}

      {/* Monaco Editor */}
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={code}
        onChange={handleEditorChange}
        options={editorOptions}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }
      />

      {/* 中文符号列表 */}
      {chineseSymbols.length > 0 && (
        <div className="absolute bottom-2 left-2 z-10 bg-red-100 border border-red-300 rounded-lg p-3 max-w-xs max-h-32 overflow-y-auto">
          <div className="text-red-800 font-medium text-sm mb-2">中文符号列表：</div>
          <div className="flex flex-wrap gap-1">
            {chineseSymbols.map((symbolInfo, index) => (
              <button
                key={index}
                onClick={() => replaceSingleSymbol(symbolInfo.symbol, symbolInfo.line, symbolInfo.column)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors cursor-pointer"
                title={`第${symbolInfo.line}行第${symbolInfo.column}列: ${symbolInfo.symbol}`}
              >
                {symbolInfo.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 状态栏 */}
      <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>语言: {language}</span>
          <span>主题: {theme}</span>
          {chineseSymbols.length > 0 && (
            <span className="text-red-400 font-medium">
              中文符号: {chineseSymbols.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>行: {editorRef.current?.getPosition()?.lineNumber || 1}</span>
          <span>列: {editorRef.current?.getPosition()?.column || 1}</span>
        </div>
      </div>
    </div>
  );
}
