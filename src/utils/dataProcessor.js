import Papa from 'papaparse';

export const processCSVData = async (csvFile) => {
    try {
        const response = await fetch(csvFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        console.log('CSV Data loaded:', csvText);
        
        const { data } = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
        });

        const deviceMap = new Map();
        const connections = new Set();

        // 第一遍循环：创建所有设备节点
        data.forEach(row => {
            const {
                NameOfStation,
                IpAddress,
                DeviceType,
                MAC,
                ManufacturerName,
                RunState
            } = row;

            // 只处理有效的设备记录
            if (DeviceType && MAC) {
                if (!deviceMap.has(MAC)) {
                    // 优化设备名称处理
                    const deviceName = NameOfStation 
                        ? NameOfStation.replace(/\.profinet.*$/, '') // 移除 profinet 后缀
                        : DeviceType;

                    deviceMap.set(MAC, {
                        id: MAC,
                        data: {
                            nameOfStation: deviceName,
                            type: DeviceType,
                            ip: IpAddress || '-',
                            mac: MAC,
                            manufacturer: ManufacturerName || '-',
                            status: RunState === 'Ok' ? 'Ok' : 'Error',
                            ports: []
                        }
                    });
                }
            }
        });

        // 第二遍循环：处理端口和连接信息
        data.forEach(row => {
            const {
                MAC,
                Port_ID,
                Port_Desc,
                Remote_Port_ID,
                Remote_Station,
                Remote_MAC,
                Port_Status
            } = row;

            if (MAC && deviceMap.has(MAC)) {
                const device = deviceMap.get(MAC);
                
                // 添加端口信息
                if (Port_ID && !device.data.ports.some(p => p.id === Port_ID)) {
                    // 查找远程设备的实际名称
                    let remoteDeviceName = '-';
                    if (Remote_MAC && deviceMap.has(Remote_MAC)) {
                        const remoteDevice = deviceMap.get(Remote_MAC);
                        remoteDeviceName = remoteDevice.data.nameOfStation;
                    } else if (Remote_Station) {
                        remoteDeviceName = Remote_Station.replace(/\.profinet.*$/, '');
                    }

                    device.data.ports.push({
                        id: Port_ID,
                        desc: Port_Desc || `Port ${Port_ID}`,
                        status: Port_Status || 'Down',
                        remoteDevice: remoteDeviceName,
                        remotePort: Remote_Port_ID || '-'
                    });
                }

                // 处理连接
                if (Remote_MAC && Port_Status === 'Up' && deviceMap.has(Remote_MAC)) {
                    const edgeId = `${MAC}-${Remote_MAC}-${Port_ID}`;
                    if (!Array.from(connections).some(edge => edge.id === edgeId)) {
                        connections.add({
                            id: edgeId,
                            source: MAC,
                            target: Remote_MAC,
                            data: {
                                sourcePort: Port_ID,
                                targetPort: Remote_Port_ID || '-'
                            }
                        });
                    }
                }
            }
        });

        const nodes = Array.from(deviceMap.values()).map(device => ({
            id: device.id,
            style: {
                fill: device.data.status === 'Ok' ? '#40a9ff' : '#ff4d4f'
            },
            data: device.data
        }));

        const edges = Array.from(connections);

        return { nodes, edges };
    } catch (error) {
        console.error('处理CSV数据时出错:', error);
        return { nodes: [], edges: [] };
    }
}; 