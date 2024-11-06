import React, { useState, useEffect } from 'react';
import { Tree, Card } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { getAvailableFiles } from '../data/deviceData';

const FileSelector = ({ onFileSelect }) => {
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    const files = getAvailableFiles();
    const fileTree = {};
    
    // 构建文件树结构
    files.forEach(({ path }) => {
      const parts = path.split('/');
      let current = fileTree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = null;
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      });
    });

    // 转换为 antd Tree 需要的格式
    const convertToTreeData = (obj, parentKey = '') => {
      return Object.entries(obj).map(([key, value]) => {
        const currentKey = parentKey ? `${parentKey}/${key}` : key;
        if (value === null) {
          return {
            title: key,
            key: currentKey,
            icon: <FileOutlined />,
            isLeaf: true
          };
        }
        return {
          title: key,
          key: currentKey,
          icon: <FolderOutlined />,
          children: convertToTreeData(value, currentKey)
        };
      });
    };

    setTreeData(convertToTreeData(fileTree));
  }, []);

  const onSelect = (selectedKeys, info) => {
    if (info.node.isLeaf) {
      onFileSelect(info.node.key);
    }
  };

  return (
    <Card title="选择设备拓扑文件" style={{ width: '100%', maxWidth: 800, margin: '20px auto' }}>
      <Tree
        showIcon
        defaultExpandAll
        onSelect={onSelect}
        treeData={treeData}
      />
    </Card>
  );
};

export default FileSelector;