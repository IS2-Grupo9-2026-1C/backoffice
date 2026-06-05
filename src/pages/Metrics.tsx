import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import Button from '@/components/Button';
import {
  getRegisteredUsersMetrics,
  RegisteredUsersMetrics,
  getOrdersMetrics,
  OrdersMetrics,
  getSalesMetrics,
  SalesMetrics,
} from '@/services/metrics';
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipValueType,
} from 'recharts';

type MetricType = 'users_registered' | 'orders_total' | 'sales_ranking';

const CHART_COLORS = [
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
];

function normalizeSeriesPoint(item: { date: string; count: unknown }): {
  date: string;
  count: number;
} {
  return {
    date: String(item.date ?? ''),
    count: Number(item.count ?? 0),
  };
}

function formatStatusLabel(status: string): string {
  if (!status) return '';
  const withSpaces = status.split('_').join(' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function productLabel(item: { item_id: string; title?: string | null }): string {
  return item.title?.trim() || item.item_id;
}

function formatUnitsSold(count: number): string {
  return count === 1 ? '1 vendido' : `${count} vendidos`;
}

function formatSellerLabel(item: {
  seller_name?: string | null;
  seller_id?: string | null;
}): string | null {
  if (item.seller_name?.trim()) {
    return `Vendedor: ${item.seller_name.trim()}`;
  }
  return null;
}

export default function Metrics() {
  const [metric, setMetric] = useState<MetricType>('users_registered');
  const [period, setPeriod] = useState<number | null>(null);
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement | null>(null);
  const [metricOpen, setMetricOpen] = useState(false);
  const metricRef = useRef<HTMLDivElement | null>(null);
  const [usersData, setUsersData] = useState<RegisteredUsersMetrics | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const metricLabel =
    metric === 'users_registered'
      ? 'Usuarios registrados'
      : metric === 'orders_total'
        ? 'Ordenes totales'
        : 'Monto transaccionado y ranking';

  const applyFetchedMetrics = useCallback(
    (activeMetric: MetricType, data: RegisteredUsersMetrics | OrdersMetrics | SalesMetrics) => {
      if (activeMetric === 'users_registered') {
        setUsersData(data as RegisteredUsersMetrics);
        setOrdersData(null);
        setSalesData(null);
      } else if (activeMetric === 'orders_total') {
        setOrdersData(data as OrdersMetrics);
        setUsersData(null);
        setSalesData(null);
      } else {
        setSalesData(data as SalesMetrics);
        setUsersData(null);
        setOrdersData(null);
      }
    },
    [],
  );

  function fetchMetrics(activeMetric: MetricType, activePeriod: number | null) {
    if (activeMetric === 'users_registered') {
      return getRegisteredUsersMetrics(activePeriod);
    }
    if (activeMetric === 'orders_total') {
      return getOrdersMetrics(activePeriod);
    }
    return getSalesMetrics(activePeriod);
  }

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);
    const request = fetchMetrics(metric, period);

    request
      .then((res) => {
        if (cancelled) return;
        applyFetchedMetrics(metric, res);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar métricas');
        if (metric === 'users_registered') {
          setUsersData(null);
        } else if (metric === 'orders_total') {
          setOrdersData(null);
        } else {
          setSalesData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [metric, period, applyFetchedMetrics]);

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

  function handleMetricSelect(value: MetricType) {
    setMetric(value);
    setPeriod(null);
    setMetricOpen(false);
  }

  function handleRefresh() {
    setLoading(true);
    fetchMetrics(metric, period)
      .then((res) => {
        applyFetchedMetrics(metric, res);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar métricas');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const usersSeriesNormalized = useMemo(
    () => (usersData ? usersData.series.map(normalizeSeriesPoint) : []),
    [usersData],
  );

  const cumulativeSeries = useMemo(() => {
    if (!usersData) return [] as { date: string; count: number }[];
    const out: { date: string; count: number }[] = [];
    let acc = 0;
    for (const item of usersSeriesNormalized) {
      acc += item.count;
      out.push({ date: item.date, count: acc });
    }
    return out;
  }, [usersData, usersSeriesNormalized]);

  const ordersSeriesNormalized = useMemo(
    () => (ordersData ? ordersData.series.map(normalizeSeriesPoint) : []),
    [ordersData],
  );

  const salesTopThree = useMemo(() => salesData?.top_products.slice(0, 3) ?? [], [salesData]);
  const salesRest = useMemo(() => salesData?.top_products.slice(3) ?? [], [salesData]);
  const podiumOrder = useMemo(() => {
    const [first, second, third] = salesTopThree;
    return [second, first, third].filter(Boolean);
  }, [salesTopThree]);

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
            <span className="truncate">{metricLabel}</span>
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
                  onClick={() => handleMetricSelect('users_registered')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    metric === 'users_registered'
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={metric === 'users_registered'}
                >
                  Usuarios registrados
                </button>
                <button
                  type="button"
                  onClick={() => handleMetricSelect('orders_total')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    metric === 'orders_total'
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={metric === 'orders_total'}
                >
                  Ordenes totales
                </button>
                <button
                  type="button"
                  onClick={() => handleMetricSelect('sales_ranking')}
                  className={`w-full px-4 py-[10px] text-left text-sm transition-colors ${
                    metric === 'sales_ranking'
                      ? 'bg-gray-100 font-semibold text-indigo-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={metric === 'sales_ranking'}
                >
                  Monto transaccionado y ranking
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

      {metric === 'users_registered' && usersData && (
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
          {period !== null ? (
            usersSeriesNormalized.length > 0 ? (
              <>
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total registrados</div>
                    <div className="text-4xl font-bold text-gray-900">{usersData.total}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Período:{' '}
                    {usersData.period_days ? `${usersData.period_days} días` : 'sin filtro'}
                  </div>
                </div>
                <div className="h-80 w-full min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart
                        data={usersSeriesNormalized}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                          {...(period === 90 ? { interval: 4 } : {})}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value) => [String(value), 'Registrados']}
                        />
                        <Bar
                          dataKey="count"
                          name="Registrados"
                          fill="#4f46e5"
                          radius={[4, 4, 0, 0]}
                          legendType="none"
                        />
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
                        <YAxis
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value) => [String(value), 'Registrados acumulados']}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Registrados acumulados"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#4f46e5' }}
                          activeDot={{ r: 5 }}
                          isAnimationActive={false}
                          connectNulls
                          legendType="none"
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-500">No hay datos para este período.</p>
              </div>
            )
          ) : (
            <>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total registrados</div>
                  <div className="text-4xl font-bold text-gray-900">{usersData.total}</div>
                </div>
              </div>
              {usersSeriesNormalized.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-[0.4px] text-gray-500">
                      <th className="px-4 py-[10px]">Fecha</th>
                      <th className="px-4 py-[10px] text-right">
                        Cantidad de usuarios registrados
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersSeriesNormalized.map((s) => (
                      <tr key={s.date} className="border-b border-gray-100">
                        <td className="p-4 text-gray-700">{s.date}</td>
                        <td className="p-4 text-right text-gray-900">{s.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </>
          )}
        </section>
      )}

      {metric === 'orders_total' && ordersData && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-sm text-gray-500">Total de ordenes</div>
              <div className="text-4xl font-bold text-gray-900">{ordersData.total}</div>
            </div>
            <div className="text-sm text-gray-500">
              Período: {ordersData.period_days ? `${ordersData.period_days} días` : 'sin filtro'}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-3 text-base font-semibold text-gray-900">Distribución por estado</h2>
            <div className="h-80 w-full min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ordersData.current_distribution}
                  margin={{ top: 20, right: 30, left: 0, bottom: 32 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="status"
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    angle={-20}
                    textAnchor="end"
                    height={70}
                    tickFormatter={(value) => formatStatusLabel(String(value))}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [String(value), 'Ordenes']}
                    labelFormatter={(value) => formatStatusLabel(String(value))}
                  />
                  <Bar dataKey="count" name="Por estado" radius={[4, 4, 0, 0]} legendType="none">
                    {ordersData.current_distribution.map((entry, index) => (
                      <Cell
                        key={`dist-${entry.status}-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {period !== null && (
            <div>
              <h2 className="mb-3 text-base font-semibold text-gray-900">
                Órdenes creadas por día
              </h2>
              <div className="h-80 w-full min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersSeriesNormalized}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      {...(period === 90 ? { interval: 4 } : {})}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [String(value), 'Órdenes creadas']}
                    />
                    <Bar
                      dataKey="count"
                      name="Órdenes creadas"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                      legendType="none"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      )}

      {metric === 'sales_ranking' && salesData && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-sm text-gray-500">Monto transaccionado</div>
              <div className="text-4xl font-bold text-gray-900">
                {formatCurrency(salesData.total_amount)}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Período: {salesData.period_days ? `${salesData.period_days} días` : 'sin filtro'}
            </div>
          </div>

          {salesData.top_products.length > 0 ? (
            <>
              {podiumOrder.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-6 text-base font-semibold text-gray-900">Top 3 productos</h2>
                  <div className="flex items-end justify-center gap-4 md:gap-8">
                    {podiumOrder.map((item) => {
                      const rank =
                        salesTopThree.findIndex((candidate) => candidate.item_id === item.item_id) +
                        1;
                      const sellerLabel = formatSellerLabel(item);
                      const podiumHeight = rank === 1 ? 'h-44' : rank === 2 ? 'h-32' : 'h-24';
                      const podiumColor =
                        rank === 1
                          ? 'bg-indigo-600'
                          : rank === 2
                            ? 'bg-indigo-500'
                            : 'bg-indigo-400';

                      return (
                        <div
                          key={item.item_id}
                          className="flex w-full max-w-[220px] flex-col items-center"
                        >
                          <div className="mb-3 flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={productLabel(item)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-gray-400">#{rank}</span>
                            )}
                          </div>
                          <p className="mb-1 line-clamp-2 min-h-[40px] text-center text-sm font-semibold text-gray-900">
                            {productLabel(item)}
                          </p>
                          {sellerLabel && (
                            <p className="mb-1 line-clamp-1 text-center text-xs text-gray-500">
                              {sellerLabel}
                            </p>
                          )}
                          <p className="mb-3 text-sm text-gray-500">
                            {formatUnitsSold(item.units_sold)}
                          </p>
                          <div
                            className={`flex w-full items-end justify-center rounded-t-xl ${podiumHeight} ${podiumColor}`}
                          >
                            <span className="pb-3 text-2xl font-bold text-white">{rank}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {salesRest.length > 0 && (
                <div>
                  <h2 className="mb-3 text-base font-semibold text-gray-900">Resto del ranking</h2>
                  <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    {salesRest.map((item, index) => {
                      const sellerLabel = formatSellerLabel(item);
                      return (
                        <div
                          key={item.item_id}
                          className="flex items-center gap-4 px-4 py-3 text-sm"
                        >
                          <span className="w-8 font-semibold text-indigo-600">{index + 4}</span>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-gray-900">
                              {productLabel(item)}
                            </span>
                            {sellerLabel && (
                              <span className="block truncate text-xs text-gray-500">
                                {sellerLabel}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-700">
                            {formatUnitsSold(item.units_sold)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">No hay ventas para este período.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
