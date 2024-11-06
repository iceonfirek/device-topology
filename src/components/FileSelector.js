import React from 'react';
import { Card, List } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { getAvailableFiles } from '../data/deviceData';

const FileSelector = ({ onFileSelect, onFolderSelect, currentFolder }) => {
  const rootFolders = ['冲压', '总装', '涂装', '车身'];
  const files = getAvailableFiles();

  // 如果在文件夹中，显示该文件夹下的文件列表
  if (currentFolder) {
    const folderFiles = files.filter(({ path }) => 
      path.startsWith(`./${currentFolder}/`)
    );

    return (
      <Card title={`${currentFolder}文件列表`} style={{ width: '100%', maxWidth: 800, margin: '20px auto' }}>
        <List
          itemLayout="horizontal"
          dataSource={folderFiles}
          renderItem={file => (
            <List.Item
              onClick={() => onFileSelect(file.path)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                avatar={<FileOutlined />}
                title={file.path.split('/').pop()}
              />
            </List.Item>
          )}
        />
      </Card>
    );
  }

  // 显示根文件夹列表
  return (
    <Card title="选择设备拓扑文件夹" style={{ width: '100%', maxWidth: 800, margin: '20px auto' }}>
      <List
        itemLayout="horizontal"
        dataSource={rootFolders}
        renderItem={folder => (
          <List.Item
            onClick={() => onFolderSelect(folder)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              avatar={<FolderOutlined />}
              title={folder}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default FileSelector;