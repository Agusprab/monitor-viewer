'use client'

import { useMemo, useEffect, memo } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import type { RootState } from '../../store'
import { fetchVisitors } from '../../store/visitorsSlice'
import { fetchUrlVisitors } from '../../store/urlVisitorsSlice'
import type { Visitor } from '../../store/visitorsSlice'
import type { UrlVisitor } from '../../store/urlVisitorsSlice'
import { 
  Globe, 
  MousePointer2, 
  Calendar,
  TrendingUp,
  UserCheck,
  Clock
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'

function DashboardLanding() {
  const dispatch = useAppDispatch()
  const visitors = useAppSelector((state: RootState) => state.visitors.data)
  const urlVisitors = useAppSelector((state: RootState) => state.urlVisitors.data)
  const loading = useAppSelector((state: RootState) => state.visitors.loading || state.urlVisitors.loading)
  const dataLoading = loading
  const error = useAppSelector((state: RootState) => state.visitors.error || state.urlVisitors.error)
   useEffect(() => {
    dispatch(fetchVisitors())
    dispatch(fetchUrlVisitors())
  }, [dispatch])

  const chartData = useMemo(() => {
    const dailyStats: Record<string, { date: string, registrations: number, clicks: number }> = {}
    visitors.forEach((v: Visitor) => {
      const date = new Date(v.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      if (!dailyStats[date]) dailyStats[date] = { date, registrations: 0, clicks: 0 }
      dailyStats[date].registrations++
    })
    urlVisitors.forEach((u: UrlVisitor) => {
      const date = new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      if (!dailyStats[date]) dailyStats[date] = { date, registrations: 0, clicks: 0 }
      dailyStats[date].clicks++
    })
    return Object.values(dailyStats).slice(-7)
  }, [visitors, urlVisitors])

  const stats = useMemo(() => [
    {
      label: 'Total Terdaftar',
      value: visitors.length,
      icon: UserCheck,
      color: 'bg-indigo-600',
      trend: '+12%',
      bgLight: 'bg-indigo-50'
    },
    {
      label: 'Submit Link',
      value: urlVisitors.length,
      icon: MousePointer2,
      color: 'bg-emerald-600',
      trend: '+8%',
      bgLight: 'bg-emerald-50'
    },
    {
      label: 'IP',
      value: new Set([...visitors.map((v: Visitor) => v.ip), ...urlVisitors.map((u: UrlVisitor) => u.ip)]).size,
      icon: Globe,
      color: 'bg-amber-600',
      trend: '+5%',
      bgLight: 'bg-amber-50'
    },
    {
      label: 'Aktivitas Hari Ini',
      value: visitors.filter((v: Visitor) => new Date(v.created_at).toDateString() === new Date().toDateString()).length +
             urlVisitors.filter((u: UrlVisitor) => new Date(u.created_at).toDateString() === new Date().toDateString()).length,
      icon: Clock,
      color: 'bg-rose-600',
      trend: '+15%',
      bgLight: 'bg-rose-50'
    }
  ], [visitors, urlVisitors])

  const pieData = useMemo(() => [
    { name: 'Reg', value: visitors.length },
    { name: 'Clicks', value: urlVisitors.length }
  ], [visitors.length, urlVisitors.length])

  const ratio = useMemo(() => Math.round((visitors.length / (visitors.length + urlVisitors.length || 1)) * 100), [visitors.length, urlVisitors.length])

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Error loading data</p>

        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 mt-1">Pantau perkembangan trafik dan konversi secara real-time.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 shadow-sm">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dataLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gray-200 rounded-xl p-3 h-12 w-12"></div>
                  <div className="flex flex-col space-y-2">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    <div className="bg-gray-200 h-6 w-16 rounded"></div>
                  </div>
                </div>
                <div className="bg-gray-200 h-4 w-12 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((s, i) => (
            <div key={i} className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className={`absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12`}>
                <s.icon size={64} className="text-slate-900" />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`${s.bgLight} rounded-xl p-3`}>
                  <s.icon className={`h-6 w-6 ${s.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-500">{s.label}</span>
                  <span className="text-2xl font-bold text-slate-900 leading-none">{s.value.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {s.trend}
                </span>
                <span className="text-xs text-slate-400 font-medium">vs bulan lalu</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Traffic Analysis</h3>
              <p className="text-sm text-slate-400">7 Hari Terakhir</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                <span className="text-xs font-semibold text-slate-500">Registrasi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-slate-500">Klik Link</span>
              </div>
            </div>
          </div>
          
          <div className="h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                   tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  name="Registrasi" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorReg)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  name="Klik Link" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorClick)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Info/Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Conversion Rate</h3>
            <p className="text-sm text-slate-400">Total data efektivitas sesi</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-4">
             <div className="relative h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      <Cell fill="#4f46e5" />
                      <Cell fill="#10b981" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {ratio}%
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ratio</span>
                </div>
             </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                <span className="text-sm font-semibold text-indigo-900">Total Registrasi</span>
              </div>
              <span className="font-bold text-indigo-900">{visitors.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
                <span className="text-sm font-semibold text-emerald-900">Total Klik Link</span>
              </div>
              <span className="font-bold text-emerald-900">{urlVisitors.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(DashboardLanding)
