import React from 'react';
import Graphin from '@antv/graphin';
import { Card, Modal, Badge } from 'antd';
import { processCSVData } from '../utils/dataProcessor';
import { csvData } from '../data/deviceData';

const DeviceGraph = ({ searchText }) => {
    const [graphData, setGraphData] = React.useState({ nodes: [], edges: [] });
    const [filteredData, setFilteredData] = React.useState({ nodes: [], edges: [] });
    const [selectedDevice, setSelectedDevice] = React.useState(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [tooltipInfo, setTooltipInfo] = React.useState(null);
    const graphRef = React.useRef(null);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const data = await processCSVData(csvData);
                console.log('Processed data:', data);
                setGraphData(data);
            } catch (error) {
                console.error('加载数据失败:', error);
            }
        };
        loadData();
    }, []);

    React.useEffect(() => {
        if (graphRef.current) {
            const graph = graphRef.current.graph;
            
            // 处理节点点击
            graph.on('node:click', (evt) => {
                const node = evt.item;
                const model = node.getModel();
                console.log('Clicked node:', model); // 调试日志
                setSelectedDevice(model.data);
                setModalVisible(true);
            });

            // 处理悬停提示
            graph.on('node:mouseenter', (evt) => {
                const { item, x, y } = evt;
                const model = item.getModel();
                const point = graph.getCanvasByPoint(x, y);
                setTooltipInfo({
                    data: model.data,
                    x: point.x,
                    y: point.y
                });
            });

            graph.on('node:mouseleave', () => {
                setTooltipInfo(null);
            });

            // 清理函数
            return () => {
                graph.off('node:click');
                graph.off('node:mouseenter');
                graph.off('node:mouseleave');
            };
        }
    }, []);

    // 添加搜索效果
    React.useEffect(() => {
        if (!graphData.nodes.length) return;
        
        if (!searchText) {
            setFilteredData(graphData);
            return;
        }

        const searchLower = searchText.toLowerCase();
        const filteredNodes = graphData.nodes.filter(node => {
            const { nameOfStation, ip, mac, type } = node.data;
            return (
                (nameOfStation && nameOfStation.toLowerCase().includes(searchLower)) ||
                (ip && ip.toLowerCase().includes(searchLower)) ||
                (mac && mac.toLowerCase().includes(searchLower)) ||
                (type && type.toLowerCase().includes(searchLower))
            );
        });

        const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
        const filteredEdges = graphData.edges.filter(edge => 
            filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
        );

        // 高亮搜索结果
        const highlightedNodes = filteredNodes.map(node => ({
            ...node,
            style: {
                ...node.style,
                opacity: 1,
                lineWidth: 3
            }
        }));

        const otherNodes = graphData.nodes
            .filter(node => !filteredNodeIds.has(node.id))
            .map(node => ({
                ...node,
                style: {
                    ...node.style,
                    opacity: 0.2
                }
            }));

        setFilteredData({
            nodes: [...highlightedNodes, ...otherNodes],
            edges: graphData.edges.map(edge => ({
                ...edge,
                style: {
                    opacity: filteredEdges.some(e => e.id === edge.id) ? 1 : 0.1
                }
            }))
        });
    }, [searchText, graphData]);

    const layout = {
        type: 'force',
        preventOverlap: true,
        nodeSpacing: 20,
        linkDistance: d => {
            const source = graphData.nodes.find(n => n.id === d.source);
            const target = graphData.nodes.find(n => n.id === d.target);
            // 如果两端都是交换机，距离设为300
            if (source?.data.portCount >= 3 && target?.data.portCount >= 3) {
                return 300;
            }
            // 如果任意一端是交换机，距离设为150
            if (source?.data.portCount >= 3 || target?.data.portCount >= 3) {
                return 50;
            }
            // 普通节点之间的距离设为最小值50
            return 20;
        },
        nodeStrength: d => {
            // 交换机节点斥力为-800，普通节点为-200
            return d.data.portCount >= 3 ? -800 : -100;
        },
        edgeStrength: edge => {
            const source = graphData.nodes.find(n => n.id === edge.source);
            const target = graphData.nodes.find(n => n.id === edge.target);
            // 交换机之间的连接强度为1
            if (source?.data.portCount >= 3 && target?.data.portCount >= 3) {
                return 1;
            }
            // 如果任意一端是交换机，强度为0.5
            if (source?.data.portCount >= 3 || target?.data.portCount >= 3) {
                return 0.5;
            }
            // 普通节点之间的连接强度设为0.2
            return 0.2;
        },
        gravity: 1,
        alpha: 0.3,
        alphaDecay: 0.01,
        alphaMin: 0.001,
        forceSimulation: null
    }

    return (
        <div style={{ width: '100%', height: '100vh', background: '#fff', position: 'relative' }}>
            <Graphin 
                ref={graphRef}
                data={filteredData}
                layout={layout}
                defaultNode={{
                    type: 'circle',
                    size: [30],
                    style: {
                        fill: 'rgba(64, 169, 255, 0.2)',
                        stroke: '#40a9ff',
                        lineWidth: 2
                    }
                }}
                nodeStateStyles={{
                    selected: {
                        fill: '#40a9ff',
                        stroke: '#40a9ff',
                        lineWidth: 2,
                        opacity: 1
                    }
                }}
                fitView={true}
                animate={false}
                modes={{
                    default: ['drag-canvas', 'zoom-canvas', 'drag-node']
                }}
            />

            {tooltipInfo && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltipInfo.x + 10,
                        top: tooltipInfo.y + 10,
                        backgroundColor: 'white',
                        padding: '8px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {tooltipInfo.data.nameOfStation || tooltipInfo.data.type}
                    </div>
                    <div>设备类型: {tooltipInfo.data.type}</div>
                    <div>IP: {tooltipInfo.data.ip}</div>
                    <div>MAC: {tooltipInfo.data.mac}</div>
                    <div>
                        状态: 
                        <span style={{
                            color: tooltipInfo.data.status === 'Ok' ? '#52c41a' : '#f5222d',
                            marginLeft: '4px'
                        }}>
                            {tooltipInfo.data.status}
                        </span>
                    </div>
                </div>
            )}

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>设备详情</span>
                        {selectedDevice && (
                            <Badge 
                                status={selectedDevice.status === 'Ok' ? 'success' : 'error'} 
                                text={selectedDevice.status} 
                                style={{ marginLeft: 8 }}
                            />
                        )}
                    </div>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setSelectedDevice(null);
                }}
                footer={null}
                width={600}
                styles={{
                    body: { 
                        maxHeight: '70vh',
                        overflow: 'auto',
                        padding: '24px'
                    }
                }}
                destroyOnClose={true}
                maskClosable={true}
                centered={true}
            >
                {selectedDevice && (
                    <div className="device-detail">
                        <Card title="基本信息" style={{ marginBottom: 16 }}>
                            <p><strong>设备名称：</strong> {selectedDevice.nameOfStation || '-'}</p>
                            <p><strong>设备类型：</strong> {selectedDevice.type}</p>
                            <p><strong>IP地址：</strong> {selectedDevice.ip}</p>
                            <p><strong>MAC地址：</strong> {selectedDevice.mac}</p>
                            <p><strong>制造商：</strong> {selectedDevice.manufacturer}</p>
                        </Card>

                        {selectedDevice.ports && selectedDevice.ports.length > 0 && (
                            <Card title="端口信息">
                                {selectedDevice.ports.map((port, index) => (
                                    <Card 
                                        key={index} 
                                        type="inner" 
                                        title={`端口 ${port.id}`}
                                        style={{ marginBottom: 8 }}
                                        extra={
                                            <Badge 
                                                status={port.status === 'Up' ? 'success' : 'error'} 
                                                text={port.status} 
                                            />
                                        }
                                    >
                                        <p><strong>描述：</strong> {port.desc || '-'}</p>
                                        <p><strong>远程设备：</strong> {port.remoteDevice || '-'}</p>
                                    </Card>
                                ))}
                            </Card>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DeviceGraph;