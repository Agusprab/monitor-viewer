"use client"

import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import * as jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { fetchUrlVisitors, updateUrlVisitor, deleteUrlVisitor, bulkDeleteUrlVisitors } from '../../../store/urlVisitorsSlice'
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
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
  X
} from 'lucide-react'

export default function UrlsPage() {
  const dispatch = useAppDispatch()
  const urlVisitors = useAppSelector((state) => state.urlVisitors.data)
  const loading = useAppSelector((state) => state.urlVisitors.loading)
  const error = useAppSelector((state) => state.urlVisitors.error)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State untuk search dan sorting
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'ip' | 'url_input' | 'created_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // State untuk select, edit, delete
  const [selectedUrlVisitors, setSelectedUrlVisitors] = useState<number[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUrlVisitor, setEditingUrlVisitor] = useState<UrlVisitor | null>(null)
  const [editForm, setEditForm] = useState({ ip: '', url_input: '' })

  useEffect(() => {
    dispatch(fetchUrlVisitors())
  }, [dispatch])

  // Handlers
  const handleSelectAll = () => {
    const currentPageIds = paginatedUrls.map(u => u.id)
    const allSelected = currentPageIds.every(id => selectedUrlVisitors.includes(id))
    
    if (allSelected) {
      // Deselect all from current page
      setSelectedUrlVisitors(prev => prev.filter(id => !currentPageIds.includes(id)))
    } else {
      // Select all from current page
      setSelectedUrlVisitors(prev => [...new Set([...prev, ...currentPageIds])])
    }
  }

  const handleSelectUrlVisitor = (id: number) => {
    setSelectedUrlVisitors(prev => 
      prev.includes(id) 
        ? prev.filter(uId => uId !== id)
        : [...prev, id]
    )
  }

  const handleEdit = (urlVisitor: UrlVisitor) => {
    setEditingUrlVisitor(urlVisitor)
    setEditForm({ ip: urlVisitor.ip, url_input: urlVisitor.url_input })
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    await dispatch(deleteUrlVisitor(id))
  }

  const handleBulkDelete = async () => {
    if (selectedUrlVisitors.length > 0) {
      await dispatch(bulkDeleteUrlVisitors(selectedUrlVisitors))
      setSelectedUrlVisitors([])
    }
  }

  const handleSaveEdit = async () => {
    if (editingUrlVisitor) {
      await dispatch(updateUrlVisitor({ ...editingUrlVisitor, ...editForm }))
      setIsEditModalOpen(false)
      setEditingUrlVisitor(null)
    }
  }

  // Handler untuk sorting
  const handleSort = (field: 'ip' | 'url_input' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset ke halaman pertama saat sorting
  }

  // Fungsi untuk sorting dan filtering data
  const getFilteredAndSortedUrls = () => {
    const filtered = urlVisitors.filter(urlVisitor =>
      urlVisitor.ip.includes(searchTerm) ||
      urlVisitor.url_input.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (sortField === 'created_at') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else {
        aValue = (aValue as string).toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const filteredAndSortedUrls = getFilteredAndSortedUrls()
  const totalPages = Math.ceil(filteredAndSortedUrls.length / itemsPerPage)
  const paginatedUrls = filteredAndSortedUrls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
              <p className="text-sm text-slate-500">
                {searchTerm ? `Menampilkan ${filteredAndSortedUrls.length} dari ${urlVisitors.length} URL` : `Total ${urlVisitors.length} URL`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedUrlVisitors.length > 0 && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300">
                <span className="text-sm font-medium text-slate-500 mr-1">
                  {selectedUrlVisitors.length} terpilih
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-semibold text-sm flex items-center gap-2 border border-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Massal
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari IP atau URL..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset ke halaman pertama saat search
                }}
                className="pl-10 pr-4 py-2 w-80 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
                className="p-2.5 rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
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
                className="p-2.5 rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                <FileText className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">
                  <button 
                    onClick={handleSelectAll} 
                    className={`p-1 rounded transition-colors ${paginatedUrls.length > 0 && paginatedUrls.every(u => selectedUrlVisitors.includes(u.id)) ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                  >
                    {paginatedUrls.length > 0 && paginatedUrls.every(u => selectedUrlVisitors.includes(u.id)) ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button 
                    onClick={() => handleSort('ip')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    IP Address
                    {sortField === 'ip' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button 
                    onClick={() => handleSort('url_input')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    URL
                    {sortField === 'url_input' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors ml-auto"
                  >
                    Visited At
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className='px-6 py-4'>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="bg-gray-200 h-4 w-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-gray-200 h-4 w-24 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-gray-200 h-4 w-40 rounded"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="bg-gray-200 h-4 w-20 rounded ml-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div className="bg-gray-200 h-8 w-8 rounded"></div>
                        <div className="bg-gray-200 h-8 w-8 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                paginatedUrls.map((u: UrlVisitor) => {
                  const isSelected = selectedUrlVisitors.includes(u.id)
                  return (
                    <tr 
                      key={u.id} 
                      className={`transition-colors ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleSelectUrlVisitor(u.id)}
                          className={`p-1 rounded transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs">
                          {u.ip}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={u.url_input}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors"
                          title={u.url_input}
                        >
                          <Globe className="h-2.5 w-2.5 mr-1" />
                          <span className="truncate max-w-[100px] ">
                            {u.url_input.replace(/^https?:\/\//, '').split('/')[0]}
                          </span>
                          <ExternalLink className="h-2 w-2 ml-1 opacity-50" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-slate-900">
                          {new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(u.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(u)}
                            className="p-2 rounded-lg border border-slate-200 text-gray-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="p-2 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-indigo-600" />
                Edit URL Visitor
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">IP Address</label>
                <input
                  type="text"
                  value={editForm.ip}
                  onChange={(e) => setEditForm(prev => ({ ...prev, ip: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">URL</label>
                <input
                  type="url"
                  value={editForm.url_input}
                  onChange={(e) => setEditForm(prev => ({ ...prev, url_input: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center font-semibold mt-4">{error}</div>
      )}
    </div>
  )
}
