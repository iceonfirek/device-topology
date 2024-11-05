import React, { useState } from 'react';
import { Layout, Input } from 'antd';
import DeviceGraph from './components/DeviceGraph';
import './App.css';

const { Header, Content } = Layout;
const { Search } = Input;

function App() {
  const [searchText, setSearchText] = useState('');

  const onSearch = (value) => {
    setSearchText(value);
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
        <span>设备拓扑图</span>
        <Search
          placeholder="搜索设备名称/IP/MAC"
          allowClear
          onSearch={onSearch}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </Header>
      <Content style={{ 
        padding: '20px',
        background: '#f0f2f5',
        height: 'calc(100vh - 64px)'
      }}>
        <DeviceGraph searchText={searchText} />
      </Content>
    </Layout>
  );
}

export default App;
