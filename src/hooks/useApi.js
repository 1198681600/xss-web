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

  const getAllClients = useCallback(() => {
    return execute(apiService.getAllClients.bind(apiService));
  }, [execute]);

  const getClient = useCallback((clientId) => {
    return execute(apiService.getClient.bind(apiService), clientId);
  }, [execute]);

  const sendCommandToAll = useCallback((command, args) => {
    return execute(apiService.sendCommandToAll.bind(apiService), command, args);
  }, [execute]);

  const sendCommandToTarget = useCallback((targetId, command, args) => {
    return execute(apiService.sendCommandToTarget.bind(apiService), targetId, command, args);
  }, [execute]);

  const sendCommandToClient = useCallback((clientId, command, args) => {
    return execute(apiService.sendCommandToClient.bind(apiService), clientId, command, args);
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