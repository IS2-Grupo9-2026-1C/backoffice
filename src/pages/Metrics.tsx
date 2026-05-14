import { useRef, useEffect, useMemo, useState } from 'react';
import Button from '@/components/Button';
import { getRegisteredUsersMetrics, RegisteredUsersMetrics } from '@/services/metrics';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Metrics() {
  const [period, setPeriod] = useState<number | null>(null);
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement | null>(null);
  const [metricOpen, setMetricOpen] = useState(false);
  const metricRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<RegisteredUsersMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);
    getRegisteredUsersMetrics(period)
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar métricas');
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (metricRef.current && !metricRef.current.contains(event.target as Node)) {
        setMetricOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMetricOpen(false);
        setPeriodOpen(false);
      }
    }

    if (metricOpen || periodOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [metricOpen, periodOpen]);

  function handlePeriodSelect(value: string) {
    setPeriod(value ? Number(value) : null);
    setPeriodOpen(false);
  }

  function handleRefresh() {
    setLoading(true);
    getRegisteredUsersMetrics(period)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar métricas');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const cumulativeSeries = useMemo(() => {
    if (!data) return [] as { date: string; count: number }[];
    const out: { date: string; count: number }[] = [];
    let acc = 0;
    for (const item of data.series) {
      acc += item.count;
      out.push({ date: item.date, count: acc });
    }
    return out;
  }, [data]);

  const periodLabel =
    period === 7
      ? 'Últimos 7 días'
      : period === 30
        ? 'Últimos 30 días'
        : period === 90
          ? 'Últimos 90 días'
          : 'Todos';

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="m-0 text-[32px] font-bold text-gray-900">Métricas</h1>
        <p className="m-0 text-base text-gray-500">Visualiza las métricas de tu plataforma.</p>
      </header>

      <section className="flex items-center gap-4">
        <div className="relative" ref={metricRef}>
          <button
            type="button"
            onClick={() => setMetricOpen((open) => !open)}
            className="flex min-w-[200px] items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none hover:bg-gray-100"
            aria-haspopup="listbox"
            aria-expanded={metricOpen}
          >
            <span className="truncate">Usuarios registrados</span>
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {metricOpen && (
            <div className="absolute left-0 z-10 mt-2 w-full overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-sm">
              <div className="py-1" role="listbox">
                <button
                  type="button"
                  onClick={() => {
                    setMetricOpen(false);
                  }}
                  className="w-full px-4 py-[10px] text-left text-sm bg-gray-100 font-semibold text-indigo-600 transition-colors"
                  role="option"
                  aria-selected={true}
                >
                  Usuarios registrados
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={periodRef}>
          <button
            type="button"
            onClick={() => setPeriodOpen((open) => !open)}
            className="flex min-w-[180px] items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-[10px] text-sm text-gray-900 outline-none hover:bg-gray-100"
            aria-haspopup="listbox"
            aria-expanded={periodOpen}
          >
            <span className="truncate">{periodLabel}</span>
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {periodOpen && (
            <div className="absolute left-0 z-10 mt-2 w-full overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-sm">
              <div className="py-1" role="listbox">
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    period === null
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={period === null}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('7')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    period === 7
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={period === 7}
                >
                  Últimos 7 días
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('30')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    period === 30
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={period === 30}
                >
                  Últimos 30 días
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodSelect('90')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    period === 90
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={period === 90}
                >
                  Últimos 90 días
                </button>
              </div>
            </div>
          )}
        </div>

        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </section>

      {error && <p className="m-0 text-sm text-red-600">{error}</p>}

      {data && (
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          {period !== null && (
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <Button
                size="sm"
                variant={chartType === 'bar' ? 'primary' : 'outline'}
                onClick={() => setChartType('bar')}
                className="px-2 py-1 text-xs"
              >
                Barras
              </Button>
              <Button
                size="sm"
                variant={chartType === 'line' ? 'primary' : 'outline'}
                onClick={() => setChartType('line')}
                className="px-2 py-1 text-xs"
              >
                Línea
              </Button>
            </div>
          )}
          {data.series.length > 0 ? (
            period !== null ? (
              <>
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total registrados</div>
                    <div className="text-4xl font-bold text-gray-900">{data.total}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Período: {data.period_days ? `${data.period_days} días` : 'sin filtro'}
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart
                        data={data.series}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                          {...(period === 90 ? { interval: 4 } : {})}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value: unknown) => [value, 'Registrados']}
                        />
                        <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={cumulativeSeries}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                          {...(period === 90 ? { interval: 4 } : {})}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value: unknown) => [value, 'Registrados acumulados']}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total registrados</div>
                    <div className="text-4xl font-bold text-gray-900">{data.total}</div>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500">
                      <th className="px-4 py-[10px]">Fecha</th>
                      <th className="px-4 py-[10px]">Cantidad de usuarios registrados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.series.map((s) => (
                      <tr key={s.date} className="border-b border-gray-100">
                        <td className="p-4 text-gray-700">{s.date}</td>
                        <td className="p-4 text-gray-900">{s.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">No hay datos para este período.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
