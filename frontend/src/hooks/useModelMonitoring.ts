import { useState, useEffect } from 'react';

interface ModelUsage {
  timestamp: number;
  model: string;
  tokens: number;
  latency: number;
}

interface ModelStats {
  totalTokens: number;
  averageLatency: number;
  requestCount: number;
}

export function useModelMonitoring() {
  const [usageHistory, setUsageHistory] = useState<ModelUsage[]>([]);
  const [stats, setStats] = useState<Record<string, ModelStats>>({});

  // Add new usage data
  const trackUsage = (model: string, tokens: number, latency: number) => {
    const usage: ModelUsage = {
      timestamp: Date.now(),
      model,
      tokens,
      latency,
    };

    setUsageHistory(prev => [...prev, usage]);
    updateStats(usage);
  };

  // Update statistics
  const updateStats = (usage: ModelUsage) => {
    setStats(prev => {
      const modelStats = prev[usage.model] || {
        totalTokens: 0,
        averageLatency: 0,
        requestCount: 0,
      };

      const newCount = modelStats.requestCount + 1;
      const newAvgLatency = (modelStats.averageLatency * modelStats.requestCount + usage.latency) / newCount;

      return {
        ...prev,
        [usage.model]: {
          totalTokens: modelStats.totalTokens + usage.tokens,
          averageLatency: newAvgLatency,
          requestCount: newCount,
        },
      };
    });
  };

  // Get stats for a specific time period
  const getStatsPeriod = (hours: number = 24) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return usageHistory.filter(usage => usage.timestamp >= cutoff);
  };

  // Clear old data periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // Keep 7 days of data
      setUsageHistory(prev => prev.filter(usage => usage.timestamp >= cutoff));
    }, 60 * 60 * 1000); // Run every hour

    return () => clearInterval(cleanup);
  }, []);

  return {
    trackUsage,
    getStatsPeriod,
    stats,
    usageHistory,
  };
}
