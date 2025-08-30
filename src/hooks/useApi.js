import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllClients = useCallback((projectId) => {
    return execute(apiService.getAllClients.bind(apiService), projectId);
  }, [execute]);

  const getClient = useCallback((clientId) => {
    return execute(apiService.getClient.bind(apiService), clientId);
  }, [execute]);

  const sendCommandToAll = useCallback((command, args, projectId) => {
    return execute(apiService.sendCommandToAll.bind(apiService), command, args, projectId);
  }, [execute]);

  const sendCommandToTarget = useCallback((targetId, command, args, projectId) => {
    return execute(apiService.sendCommandToTarget.bind(apiService), targetId, command, args, projectId);
  }, [execute]);

  const sendCommandToClient = useCallback((clientId, command, args, projectId) => {
    return execute(apiService.sendCommandToClient.bind(apiService), clientId, command, args, projectId);
  }, [execute]);

  return {
    loading,
    error,
    getAllClients,
    getClient,
    sendCommandToAll,
    sendCommandToTarget,
    sendCommandToClient,
    clearError: () => setError(null)
  };
};