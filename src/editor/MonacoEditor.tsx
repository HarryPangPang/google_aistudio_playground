import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';

export default function MonacoEditor({ code, path, language, onChange, onMount }: { code: string, path: string, language?: string, onChange: (val: string) => void, onMount?: (editor: any, monaco: any) => void }) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;
    const monacoAny = monaco as any;
    const ts = monacoAny.languages?.typescript;
    if (!ts?.typescriptDefaults) return;

    // 配置 TypeScript 编译器选项
    ts.typescriptDefaults.setCompilerOptions({
      // 修复 TS 找不到模块的问题
      baseUrl: '/',
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      target: ts.ScriptTarget.ESNext,
      allowImportingTsExtensions: true,
      allowNonTsExtensions: true,
      module: ts.ModuleKind.ESNext,
      noEmit: false, // 必须开启 emit 才能获取转译代码
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types']
    });

    // 加载 React 类型定义
    const loadTypes = async () => {
      const urls = {
        'react-index': 'https://unpkg.com/@types/react@18.3.1/index.d.ts',
        'react-global': 'https://unpkg.com/@types/react@18.3.1/global.d.ts',
        'react-jsx': 'https://unpkg.com/@types/react@18.3.1/jsx-runtime.d.ts',
        'react-dom-index': 'https://unpkg.com/@types/react-dom@18.3.0/index.d.ts',
        'react-dom-client': 'https://unpkg.com/@types/react-dom@18.3.0/client.d.ts',
        'csstype': 'https://unpkg.com/csstype@3.1.3/index.d.ts',
        'prop-types': 'https://unpkg.com/@types/prop-types@15.7.11/index.d.ts',
      };

      const promises = Object.entries(urls).map(([key, url]) => 
        fetch(url).then(res => res.text()).then(text => ({ key, text }))
      );

      const results = await Promise.all(promises);
      const typeMap = results.reduce((acc, {key, text}) => ({...acc, [key]: text}), {} as Record<string, string>);

      ts.typescriptDefaults.addExtraLib(typeMap['react-index'], 'file:///node_modules/@types/react/index.d.ts');
      ts.typescriptDefaults.addExtraLib(typeMap['react-global'], 'file:///node_modules/@types/react/global.d.ts');
      ts.typescriptDefaults.addExtraLib(typeMap['react-jsx'], 'file:///node_modules/@types/react/jsx-runtime.d.ts');
      
      ts.typescriptDefaults.addExtraLib(typeMap['react-dom-index'], 'file:///node_modules/@types/react-dom/index.d.ts');
      ts.typescriptDefaults.addExtraLib(typeMap['react-dom-client'], 'file:///node_modules/@types/react-dom/client.d.ts');
      
      // Fix missing dependencies causing "Cannot find module 'react'"
      ts.typescriptDefaults.addExtraLib(typeMap['csstype'], 'file:///node_modules/csstype/index.d.ts');
      ts.typescriptDefaults.addExtraLib(typeMap['prop-types'], 'file:///node_modules/@types/prop-types/index.d.ts');
    };

    loadTypes();
  }, [monaco]);

  return (
    <Editor
      height="100%"
      language={language || 'typescript'}
      path={path}
      value={code}
      onChange={v => onChange(v || '')}
      onMount={onMount}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}
