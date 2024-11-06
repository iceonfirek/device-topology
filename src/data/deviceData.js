// 导入主目录下的所有文件
const importAll = (r) => {
  const files = {};
  r.keys().forEach((key) => {
    files[key] = r(key);
  });
  return files;
};

// 使用 webpack 的 require.context 导入所有 CSV 文件
const csvFiles = importAll(require.context('../test', true, /\.csv$/));

console.log('Available CSV files:', csvFiles); // 调试日志

// 导出 csvData 供 DeviceGraph 使用
export const csvData = csvFiles;

export const getAvailableFiles = () => {
  // 返回文件结构对象
  return Object.keys(csvFiles).map(path => ({
    path,
    fullPath: csvFiles[path]
  }));
};

export const loadCsvFile = (filePath) => {
  return csvFiles[filePath];
};
