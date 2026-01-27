'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import * as jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { fetchVisitors } from '../../../store/visitorsSlice'
import { fetchUrlVisitors } from '../../../store/urlVisitorsSlice'
import type { RootState } from '../../../store'
import { 
  Users, 
  Globe, 
  Calendar, 
  Search, 
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText
} from 'lucide-react'



export default function VisitorsPage() {
  const dispatch = useAppDispatch()
  const visitors = useAppSelector((state: RootState) => state.visitors.data)
  const urlVisitors = useAppSelector((state: RootState) => state.urlVisitors.data)
  const loading = useAppSelector((state: RootState) => state.visitors.loading || state.urlVisitors.loading)

  useEffect(() => {
    dispatch(fetchVisitors())
    dispatch(fetchUrlVisitors())
  }, [dispatch])

  const [currentPageVisitors, setCurrentPageVisitors] = useState(1)
  const [currentPageUrls, setCurrentPageUrls] = useState(1)
  const itemsPerPage = 10



  const totalPagesVisitors = Math.ceil(visitors.length / itemsPerPage)
  const paginatedVisitors = visitors.slice((currentPageVisitors - 1) * itemsPerPage, currentPageVisitors * itemsPerPage)

  const totalPagesUrls = Math.ceil(urlVisitors.length / itemsPerPage)
  const paginatedUrls = urlVisitors.slice((currentPageUrls - 1) * itemsPerPage, currentPageUrls * itemsPerPage)

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Managemen</h1>
        <p className="text-slate-500">Kelola informasi pengunjung dan aktivitas tracking</p>
      </div>

      {/* Visitor Table Section */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Data Registration</h3>
              <p className="text-sm text-slate-500">Total {visitors.length} Registrasi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csv = Papa.unparse(visitors.map(v => ({
                  Nama: v.name,
                  Email: v.email,
                  'No. Telp': v.no_tlp,
                  'IP Address': v.ip,
                  'Registered At': v.created_at
                })))
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'visitors.csv')
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              title="Export to CSV"
              className="p-2 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <FileSpreadsheet className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                const doc = new jsPDF.jsPDF()
                autoTable(doc, {
                  head: [['Nama', 'Email', 'No. Telp', 'IP Address', 'Registered At']],
                  body: visitors.map(v => [v.name, v.email, v.no_tlp, v.ip, v.created_at]),
                  startY: 20
                })
                doc.text('Data Visitor', 14, 14)
                doc.save('visitors.pdf')
              }}
              title="Export to PDF"
              className="p-2 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <FileText className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Visitor</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4 text-right">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVisitors.map((v: import('../../../store/visitorsSlice').Visitor) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {v.no_tlp}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs">
                      {v.ip}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm text-slate-900">
                      {new Date(v.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(v.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <p className="text-sm text-slate-500">
            Halaman <span className="font-medium text-slate-900 text-sm">{currentPageVisitors}</span> dari <span className="font-medium text-slate-900 text-sm">{totalPagesVisitors}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPageVisitors(p => Math.max(1, p - 1))}
              disabled={currentPageVisitors === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setCurrentPageVisitors(p => Math.min(totalPagesVisitors, p + 1))}
              disabled={currentPageVisitors === totalPagesVisitors}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
