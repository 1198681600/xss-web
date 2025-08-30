import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Loading } from './ui';
import { useApi } from '../hooks/useApi';
import { formatTimestamp, formatClientId } from '../utils/format';
import { CLIENT_STATUS } from '../types';
import './ClientList.css';

const ClientList = ({ onSelectClient, selectedClientId, refreshTrigger, readonly = false }) => {
  const [clients, setClients] = useState([]);
  const { getAllClients, loading } = useApi();

  const fetchClients = async () => {
    try {
      const response = await getAllClients();
      if (response.status === 'success') {
        setClients(response.data || []);
      }
    } catch (error) {
      console.error('获取客户端列表失败:', error);
      setClients([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [refreshTrigger, getAllClients]);

  const getStatusBadge = (status) => {
    const statusMap = {
      [CLIENT_STATUS.ONLINE]: { variant: 'success', text: '在线' },
      [CLIENT_STATUS.OFFLINE]: { variant: 'danger', text: '离线' },
      [CLIENT_STATUS.CONNECTING]: { variant: 'warning', text: '连接中' }
    };

    const statusInfo = statusMap[status] || { variant: 'default', text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      'victim': { variant: 'danger', text: '靶机' },
      'attacker': { variant: 'primary', text: '攻击者' }
    };

    const roleInfo = roleMap[role] || { variant: 'secondary', text: role };
    return <Badge variant={roleInfo.variant}>{roleInfo.text}</Badge>;
  };

  if (loading && clients.length === 0) {
    return (
      <Card title="连接的客户端" className="client-list">
        <div className="client-list__loading">
          <Loading text="加载客户端列表..." />
        </div>
      </Card>
    );
  }

  return (
    <Card title="连接的客户端" className="client-list">
      <div className="client-list__header">
        <div className="client-list__stats">
          总计: {clients.length} 个客户端
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchClients}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="client-list__empty">
          <p>暂无连接的客户端</p>
          <p className="client-list__empty-hint">
            请在目标页面注入载荷后再查看
          </p>
        </div>
      ) : (
        <div className="client-list__grid">
          {clients.map((client) => (
            <div
              key={client.id}
              className={`client-card ${
                selectedClientId === client.id ? 'client-card--selected' : ''
              }`}
              onClick={() => !readonly && onSelectClient(client)}
              style={{ cursor: readonly ? 'default' : 'pointer' }}
            >
              <div className="client-card__header">
                <div className="client-card__id">
                  {formatClientId(client.id)}
                </div>
                <div className="client-card__badges">
                  {getStatusBadge(client.status)}
                  {getRoleBadge(client.role)}
                </div>
              </div>

              <div className="client-card__info">
                <div className="client-card__info-item">
                  <span className="client-card__label">IP:</span>
                  <span className="client-card__value">{client.ip || '--'}</span>
                </div>
                <div className="client-card__info-item">
                  <span className="client-card__label">连接时间:</span>
                  <span className="client-card__value">
                    {formatTimestamp(client.connect_time)}
                  </span>
                </div>
                <div className="client-card__info-item">
                  <span className="client-card__label">最后活动:</span>
                  <span className="client-card__value">
                    {formatTimestamp(client.last_seen)}
                  </span>
                </div>
              </div>

              {client.user_agent && (
                <div className="client-card__user-agent">
                  <span className="client-card__label">User Agent:</span>
                  <span className="client-card__value" title={client.user_agent}>
                    {client.user_agent.length > 60
                      ? `${client.user_agent.slice(0, 60)}...`
                      : client.user_agent
                    }
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ClientList;