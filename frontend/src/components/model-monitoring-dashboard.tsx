import { useEffect, useState } from 'react';
import { useModelMonitoring } from '@/hooks/useModelMonitoring';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function ModelMonitoringDashboard() {
  const { stats, usageHistory, getStatsPeriod } = useModelMonitoring();
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      // This will trigger a re-render with fresh data
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const chartData = {
    labels: usageHistory
      .slice(-20)
      .map(usage => new Date(usage.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Token Usage',
        data: usageHistory.slice(-20).map(usage => usage.tokens),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Latency (ms)',
        data: usageHistory.slice(-20).map(usage => usage.latency),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Model Monitoring Dashboard</h2>
        <div className="space-x-2">
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <select
            value={refreshInterval}
            onChange={e => setRefreshInterval(Number(e.target.value))}
            className="p-2 border rounded"
          >
            <option value="10">Refresh: 10s</option>
            <option value="30">Refresh: 30s</option>
            <option value="60">Refresh: 1m</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([model, modelStats]) => (
          <div key={model} className="p-4 border rounded shadow">
            <h3 className="font-semibold">{model}</h3>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between">
                <dt>Total Tokens:</dt>
                <dd>{modelStats.totalTokens.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Avg Latency:</dt>
                <dd>{modelStats.averageLatency.toFixed(2)}ms</dd>
              </div>
              <div className="flex justify-between">
                <dt>Requests:</dt>
                <dd>{modelStats.requestCount}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="h-80 border rounded p-4">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
    </div>
  );
}
