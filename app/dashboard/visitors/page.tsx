'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import * as jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { fetchVisitors, updateVisitor, deleteVisitor, bulkDeleteVisitors } from '../../../store/visitorsSlice'
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

  // State untuk search dan sorting
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'name' | 'email' | 'no_tlp' | 'ip' | 'created_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // State untuk select, edit, delete
  const [selectedVisitors, setSelectedVisitors] = useState<number[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingVisitor, setEditingVisitor] = useState<import('../../../store/visitorsSlice').Visitor | null>(null)
  const [deletingVisitorId, setDeletingVisitorId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', no_tlp: '' })

  // Handlers
  const handleSelectAll = () => {
    const currentPageIds = paginatedVisitors.map(v => v.id)
    const allSelected = currentPageIds.every(id => selectedVisitors.includes(id))
    
    if (allSelected) {
      // Deselect all from current page
      setSelectedVisitors(prev => prev.filter(id => !currentPageIds.includes(id)))
    } else {
      // Select all from current page
      setSelectedVisitors(prev => [...new Set([...prev, ...currentPageIds])])
    }
  }

  const handleSelectVisitor = (id: number) => {
    setSelectedVisitors(prev => 
      prev.includes(id) 
        ? prev.filter(vId => vId !== id)
        : [...prev, id]
    )
  }

  const handleEdit = (visitor: import('../../../store/visitorsSlice').Visitor) => {
    setEditingVisitor(visitor)
    setEditForm({ name: visitor.name, email: visitor.email, no_tlp: visitor.no_tlp })
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeletingVisitorId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingVisitorId) {
      await dispatch(deleteVisitor(deletingVisitorId))
      setIsDeleteModalOpen(false)
      setDeletingVisitorId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVisitors.length > 0) {
      await dispatch(bulkDeleteVisitors(selectedVisitors))
      setSelectedVisitors([])
    }
  }

  const handleSaveEdit = async () => {
    if (editingVisitor) {
      await dispatch(updateVisitor({ ...editingVisitor, ...editForm }))
      setIsEditModalOpen(false)
      setEditingVisitor(null)
    }
  }

  // Handler untuk sorting
  const handleSort = (field: 'name' | 'email' | 'no_tlp' | 'ip' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPageVisitors(1) // Reset ke halaman pertama saat sorting
  }

  // Fungsi untuk sorting dan filtering data
  const getFilteredAndSortedVisitors = () => {
    const filtered = visitors.filter(visitor =>
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.no_tlp.includes(searchTerm) ||
      visitor.ip.includes(searchTerm)
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

  const filteredAndSortedVisitors = getFilteredAndSortedVisitors()
  const totalPagesVisitors = Math.ceil(filteredAndSortedVisitors.length / itemsPerPage)
  const paginatedVisitors = filteredAndSortedVisitors.slice((currentPageVisitors - 1) * itemsPerPage, currentPageVisitors * itemsPerPage)

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
              <p className="text-sm text-slate-500">
                {searchTerm ? `Menampilkan ${filteredAndSortedVisitors.length} dari ${visitors.length} Registrasi` : `Total ${visitors.length} Registrasi`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedVisitors.length > 0 && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300">
                <span className="text-sm font-medium text-slate-500 mr-1">
                  {selectedVisitors.length} terpilih
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

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, email, telepon, atau IP..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPageVisitors(1) // Reset ke halaman pertama saat search
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
                className="p-2.5 rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
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
                    className={`p-1 rounded transition-colors ${paginatedVisitors.length > 0 && paginatedVisitors.every(v => selectedVisitors.includes(v.id)) ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                  >
                    {paginatedVisitors.length > 0 && paginatedVisitors.every(v => selectedVisitors.includes(v.id)) ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    Visitor
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button 
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    Contact
                    {sortField === 'email' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
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
                <th className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors ml-auto"
                  >
                    Registered At
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className='px-6 py-4'>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVisitors.map((v: import('../../../store/visitorsSlice').Visitor) => {
                const isSelected = selectedVisitors.includes(v.id)
                return (
                  <tr 
                    key={v.id} 
                    className={`transition-colors ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleSelectVisitor(v.id)}
                        className={`p-1 rounded transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </button>
                    </td>
 
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
              
                        <button 
                          onClick={() => handleEdit(v)}
                          className="p-2 rounded-lg border border-slate-200 text-gray-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                          <button 
                            onClick={() => handleDelete(v.id)}
                            className="p-2 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                          <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                  </td>
                </tr>
                )
              })}
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-indigo-600" />
                Edit Visitor
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
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Masukkan nama"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Nomor Telepon</label>
                <input
                  type="text"
                  value={editForm.no_tlp}
                  onChange={(e) => setEditForm(prev => ({ ...prev, no_tlp: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="0812..."
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Data?</h3>
              <p className="text-slate-500 text-sm">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-sm shadow-red-200 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
