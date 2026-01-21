import React, { useState } from 'react';

interface FileTreeProps {
  files: Record<string, string>;
  selectedFile: string;
  onSelect: (path: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileNode[];
  isOpen?: boolean;
}

const buildFileTree = (files: Record<string, string>) => {
  const root: FileNode[] = [];

  Object.keys(files).sort().forEach(path => {
    // Remove leading slash for processing
    const parts = path.replace(/^\//, '').split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existingNode = currentLevel.find(node => node.name === part);

      if (existingNode) {
        if (!isFile && existingNode.children) {
          currentLevel = existingNode.children;
        }
      } else {
        const newNode: FileNode = {
          name: part,
          path: isFile ? path : '', 
          isFolder: !isFile,
          children: isFile ? undefined : [],
          isOpen: true 
        };
        currentLevel.push(newNode);
        if (!isFile && newNode.children) {
          currentLevel = newNode.children;
        }
      }
    });
  });

  return root;
};

const FileTreeNode: React.FC<{ node: FileNode; selectedFile: string; onSelect: (path: string) => void; depth: number }> = ({ node, selectedFile, onSelect, depth }) => {
  const [isOpen, setIsOpen] = useState(node.isOpen);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (node.isFolder) {
      setIsOpen(!isOpen);
    } else {
      // Ensure path has leading slash if that's how it's stored in App
      // The path in buildFileTree came from keys which likely have leading slash
      onSelect(node.path);
    }
  };

  const isActive = node.path === selectedFile;

  return (
    <div>
      <div 
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          paddingLeft: `${depth * 12 + 10}px`, 
          cursor: 'pointer',
          paddingTop: '6px',
          paddingBottom: '6px',
          backgroundColor: isActive ? '#e0e7ff' : (isHovered ? '#f3f4f6' : 'transparent'),
          color: isActive ? '#4f46e5' : '#374151',
          display: 'flex',
          alignItems: 'center',
          fontSize: '13px',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{ marginRight: '6px', opacity: 0.7, fontSize: '10px', width: '12px', display: 'inline-block', textAlign: 'center' }}>
            {node.isFolder ? (isOpen ? '▼' : '▶') : '📄'}
        </span>
        <span style={{ fontWeight: isActive ? 600 : 400 }}>{node.name}</span>
      </div>
      {node.isFolder && isOpen && node.children && (
        <div>
          {node.children.sort((a, b) => {
              if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
              return a.isFolder ? -1 : 1;
          }).map(child => (
            <FileTreeNode key={child.name} node={child} selectedFile={selectedFile} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  const tree = buildFileTree(files);

  return (
    <div style={{ 
      width: '220px', 
      borderRight: '1px solid #e5e7eb', 
      height: '100%', 
      overflowY: 'auto', 
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
       <div style={{ 
         padding: '12px 16px', 
         fontWeight: '700', 
         fontSize: '11px', 
         color: '#6b7280', 
         letterSpacing: '0.05em',
         borderBottom: '1px solid #e5e7eb',
         textTransform: 'uppercase',
         marginBottom: '4px'
       }}>
         Explorer
       </div>
      {tree.map(node => (
        <FileTreeNode key={node.name} node={node} selectedFile={selectedFile} onSelect={onSelect} depth={0} />
      ))}
    </div>
  );
}
