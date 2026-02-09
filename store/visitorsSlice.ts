import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createSupabaseClient } from '@/lib/supabase'

export interface UrlVisitor {
  id: number
  url_input: string
  visitor_id: number
}

export interface Visitor {
  id: number
  name: string
  email: string
  no_tlp: string
  ip: string
  created_at: string
  url_visitor?: UrlVisitor[]
}

interface VisitorsState {
  data: Visitor[]
  loading: boolean
  error: string | null
}

const initialState: VisitorsState = {
  data: [],
  loading: false,
  error: null,
}

export const fetchVisitors = createAsyncThunk('visitors/fetchVisitors', async (_, { rejectWithValue }) => {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('visitor')
      .select('id,name,email,no_tlp,ip,created_at, url_visitor(id,url_input, visitor_id)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return (data || []).reverse()
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch visitors')
  }
})


export const updateVisitor = createAsyncThunk(
  'visitors/updateVisitor',
  async (visitor: Visitor, { rejectWithValue }) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('visitor')
        .update({
          name: visitor.name,
          email: visitor.email,
          no_tlp: visitor.no_tlp,
        })
        .eq('id', visitor.id)
      if (error) throw error
      return data
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update visitor')
    }
  }
)

export const deleteVisitor = createAsyncThunk(
  'visitors/deleteVisitor',
  async (visitorId: number, { rejectWithValue }) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('visitor')
        .delete()
        .eq('id', visitorId)
      if (error) throw error
      return visitorId
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete visitor')
    }
  }
)

export const bulkDeleteVisitors = createAsyncThunk(
  'visitors/bulkDeleteVisitors',
  async (visitorIds: number[], { rejectWithValue }) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('visitor')
        .delete()
        .in('id', visitorIds)
      if (error) throw error
      return visitorIds
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to bulk delete visitors')
    }
  }
)


const visitorsSlice = createSlice({
  name: 'visitors',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchVisitors.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(updateVisitor.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateVisitor.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          const updatedVisitor = action.payload as Visitor
          const index = state.data.findIndex(v => v.id === updatedVisitor.id)
          if (index !== -1) {
            state.data[index] = updatedVisitor
          }
        }
      })
      .addCase(updateVisitor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(deleteVisitor.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteVisitor.fulfilled, (state, action) => {
        state.loading = false
        state.data = state.data.filter(v => v.id !== action.payload)
      })
      .addCase(deleteVisitor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(bulkDeleteVisitors.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkDeleteVisitors.fulfilled, (state, action) => {
        state.loading = false
        const idsToDelete = action.payload
        state.data = state.data.filter(v => !idsToDelete.includes(v.id))
      })
      .addCase(bulkDeleteVisitors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })  
  },
})

export default visitorsSlice.reducer
