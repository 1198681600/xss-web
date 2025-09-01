// 统一的时间格式配置
export const DEFAULT_LOCALE_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return '--';
  }
  
  if (typeof timestamp === 'string') {
    // 如果是数字字符串形式（包含科学计数法），转换为数字再处理
    if (/^[\d.e+\-]+$/i.test(timestamp)) {
      const numTimestamp = parseFloat(timestamp);
      // 判断是毫秒还是秒级时间戳
      const multiplier = numTimestamp > 1e12 ? 1 : 1000;
      return new Date(numTimestamp * multiplier).toLocaleString('zh-CN', DEFAULT_LOCALE_OPTIONS);
    }
    
    // 处理ISO字符串
    return new Date(timestamp).toLocaleString('zh-CN', DEFAULT_LOCALE_OPTIONS);
  }
  
  if (typeof timestamp === 'number') {
    // 判断是毫秒还是秒级时间戳
    const multiplier = timestamp > 1e12 ? 1 : 1000;
    return new Date(timestamp * multiplier).toLocaleString('zh-CN', DEFAULT_LOCALE_OPTIONS);
  }
  
  return '--';
};

// 格式化任意日期字符串或Date对象到本地时区
export const formatDate = (dateInput) => {
  if (!dateInput) return '--';
  return new Date(dateInput).toLocaleString('zh-CN', DEFAULT_LOCALE_OPTIONS);
};

export const formatClientId = (clientId) => {
  if (!clientId) return '--';
  return clientId.length > 12 ? `${clientId.slice(0, 8)}...${clientId.slice(-4)}` : clientId;
};

export const formatResult = (result) => {
  if (!result) return '--';
  if (typeof result === 'string') {
    return result.length > 100 ? `${result.slice(0, 100)}...` : result;
  }
  if (typeof result === 'object') {
    try {
      const str = JSON.stringify(result, null, 2);
      return str.length > 200 ? `${str.slice(0, 200)}...` : str;
    } catch {
      return '[Object]';
    }
  }
  return String(result);
};