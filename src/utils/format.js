export const formatTimestamp = (timestamp) => {
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  return '--';
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