import React, { useState, useEffect } from 'react';

interface SimpleChineseDetectorProps {
  code: string;
  onChange: (value: string) => void;
}

export default function SimpleChineseDetector({ code, onChange }: SimpleChineseDetectorProps) {
  const [chineseSymbols, setChineseSymbols] = useState<Array<{line: number, column: number, symbol: string}>>([]);

  // 中文符号检测
  const detectChineseSymbols = (code: string) => {
    console.log('🔍 开始检测中文符号，代码长度:', code.length);
    
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
          console.log(`🎯 发现中文符号: "${char}" 在第${lineIndex + 1}行第${charIndex + 1}列`);
          symbols.push({
            line: lineIndex + 1,
            column: charIndex + 1,
            symbol: char,
          });
        }
      });
    });

    console.log(`📊 总共发现 ${symbols.length} 个中文符号:`, symbols);
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
    alert(`已修复 ${chineseSymbols.length} 个中文符号`);
    setChineseSymbols([]);
  };

  // 点击替换单个中文符号
  const replaceSingleSymbol = (symbol: string, line: number, column: number) => {
    console.log(`🔄 开始替换符号: "${symbol}" 在第${line}行第${column}列`);
    
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

    const lines = code.split('\n');
    
    if (lines[line - 1]) {
      const lineContent = lines[line - 1];
      const newLineContent = lineContent.substring(0, column - 1) + replacement + lineContent.substring(column);
      lines[line - 1] = newLineContent;
      
      const newCode = lines.join('\n');
      console.log(`✅ 替换完成: "${symbol}" -> "${replacement}"`);
      onChange(newCode);
      
      alert(`已将 "${symbol}" 替换为 "${replacement}"`);
    }
  };

  // 监听代码变化
  useEffect(() => {
    console.log('📡 useEffect 触发，检测代码:', code.substring(0, 50));
    detectChineseSymbols(code);
  }, [code]);

  return (
    <div className="relative w-full h-full">
      {/* 调试信息 */}
      <div className="absolute top-2 left-2 z-20 bg-blue-100 border border-blue-300 rounded p-2 text-xs">
        <div>代码长度: {code.length}</div>
        <div>中文符号: {chineseSymbols.length}</div>
        <button 
          onClick={() => detectChineseSymbols(code)}
          className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          重新检测
        </button>
      </div>

      {/* 中文符号检测提示 */}
      {chineseSymbols.length > 0 && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg max-w-xs">
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
        </div>
      )}

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

      {/* 测试输入框 */}
      <div className="w-full h-full p-4">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-blue-900 bg-gradient-to-b from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg"
          placeholder="在这里输入代码，包含中文符号进行测试..."
        />
      </div>
    </div>
  );
}
