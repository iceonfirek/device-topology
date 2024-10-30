import React from 'react';
import { Card, Badge } from 'antd';

const DeviceNodeTooltip = ({ data }) => {
    if (!data) return null;
    
    return (
        <Card 
            size="small" 
            title={data.nameOfStation || data.type}
            style={{
                border: '1px solid #1890ff',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                maxWidth: '300px'
            }}
        >
            <p>设备类型: {data.type}</p>
            <p>IP: {data.ip}</p>
            <p>MAC: {data.mac}</p>
            <p>
                状态: 
                <Badge 
                    status={data.status === 'Ok' ? 'success' : 'error'} 
                    text={data.status} 
                    style={{ marginLeft: 8 }}
                />
            </p>
        </Card>
    );
};

export default DeviceNodeTooltip; 