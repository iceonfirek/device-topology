import React from 'react';
import { Layout } from 'antd';
import DeviceGraph from './components/DeviceGraph';
import './App.css';

const { Header, Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        color: 'white', 
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        background: '#001529'
      }}>
        设备拓扑图
      </Header>
      <Content style={{ 
        padding: '20px',
        background: '#f0f2f5',
        height: 'calc(100vh - 64px)'
      }}>
        <DeviceGraph />
      </Content>
    </Layout>
  );
}

export default App;
