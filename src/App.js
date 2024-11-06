import React, { useState } from 'react';
import { Layout, Input, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import DeviceGraph from './components/DeviceGraph';
import FileSelector from './components/FileSelector';
import './App.css';

const { Header, Content } = Layout;
const { Search } = Input;

function App() {
  const [searchText, setSearchText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);

  const onSearch = (value) => {
    setSearchText(value);
  };

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
  };

  const handleFolderSelect = (folderName) => {
    setCurrentFolder(folderName);
  };

  const handleBack = () => {
    if (selectedFile) {
      setSelectedFile(null);
      setSearchText('');
    } else if (currentFolder) {
      setCurrentFolder(null);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        color: 'white', 
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        background: '#001529',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {(selectedFile || currentFolder) && (
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              style={{ color: 'white' }}
            />
          )}
          <span>设备拓扑图</span>
        </div>
        {selectedFile && (
          <Search
            placeholder="搜索设备名称/IP/MAC"
            allowClear
            onSearch={onSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        )}
      </Header>
      <Content style={{ 
        padding: '20px',
        background: '#f0f2f5',
        height: 'calc(100vh - 64px)'
      }}>
        {selectedFile ? (
          <DeviceGraph searchText={searchText} selectedFile={selectedFile} />
        ) : (
          <FileSelector 
            onFileSelect={handleFileSelect}
            onFolderSelect={handleFolderSelect}
            currentFolder={currentFolder}
          />
        )}
      </Content>
    </Layout>
  );
}

export default App;
