"use client"

import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import * as jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { fetchUrlVisitors } from '../../../store/urlVisitorsSlice'
import type { UrlVisitor } from '../../../store/urlVisitorsSlice'

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

export default function UrlsPage() {
  const dispatch = useAppDispatch()
  const urlVisitors = useAppSelector((state) => state.urlVisitors.data)
  const loading = useAppSelector((state) => state.urlVisitors.loading)
  const error = useAppSelector((state) => state.urlVisitors.error)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    dispatch(fetchUrlVisitors())
  }, [dispatch])

  const totalPages = Math.ceil(urlVisitors.length / itemsPerPage)
  const paginatedUrls = urlVisitors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
       
          List URL Visitor
        </h1>
        <p className="text-slate-500">Daftar URL yang disubmit oleh pengunjung</p>
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Data URL Visitor</h3>
              <p className="text-sm text-slate-500">Total {urlVisitors.length} URL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csv = Papa.unparse(urlVisitors.map(u => ({
                  'IP Address': u.ip,
                  URL: u.url_input,
                  'Visited At': u.created_at
                })))
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'url_visitors.csv')
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
                  head: [['IP Address', 'URL', 'Visited At']],
                  body: urlVisitors.map(u => [u.ip, u.url_input, u.created_at]),
                  startY: 20
                })
                doc.text('Data URL Visitor', 14, 14)
                doc.save('url_visitors.pdf')
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
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">URL</th>
                <th className="px-6 py-4 text-right">Visited At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="bg-gray-200 h-4 w-24 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-gray-200 h-4 w-40 rounded"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="bg-gray-200 h-4 w-20 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : (
                paginatedUrls.map((u: UrlVisitor) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs">
                        {u.ip}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {u.url_input}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-slate-900">
                        {new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(u.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <p className="text-sm text-slate-500">
            Halaman <span className="font-medium text-slate-900 text-sm">{currentPage}</span> dari <span className="font-medium text-slate-900 text-sm">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="text-red-600 text-center font-semibold mt-4">{error}</div>
      )}
    </div>
  )
}
