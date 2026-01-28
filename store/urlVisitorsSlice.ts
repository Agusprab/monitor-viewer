import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createSupabaseClient } from '@/lib/supabase'

export interface UrlVisitor {
  id: number
  ip: string
  url_input: string
  created_at: string
}

interface UrlVisitorsState {
  data: UrlVisitor[]
  loading: boolean
  error: string | null
}

const initialState: UrlVisitorsState = {
  data: [],
  loading: false,
  error: null,
}

export const fetchUrlVisitors = createAsyncThunk('urlVisitors/fetchUrlVisitors', async (_, { rejectWithValue }) => {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('url_visitor')
      .select('id,ip,url_input,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return (data || []).reverse()
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch url visitors')
  }
})

export const updateUrlVisitor = createAsyncThunk(
  'urlVisitors/updateUrlVisitor',
  async (urlVisitor: UrlVisitor, { rejectWithValue }) => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('url_visitor')
        .update({
          ip: urlVisitor.ip,
          url_input: urlVisitor.url_input,
        })
        .eq('id', urlVisitor.id)
      if (error) throw error
      return data
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update url visitor')
    }
  }
)

export const deleteUrlVisitor = createAsyncThunk(
  'urlVisitors/deleteUrlVisitor',
  async (urlVisitorId: number, { rejectWithValue }) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('url_visitor')
        .delete()
        .eq('id', urlVisitorId)
      if (error) throw error
      return urlVisitorId
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete url visitor')
    }
  }
)

export const bulkDeleteUrlVisitors = createAsyncThunk(
  'urlVisitors/bulkDeleteUrlVisitors',
  async (urlVisitorIds: number[], { rejectWithValue }) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('url_visitor')
        .delete()
        .in('id', urlVisitorIds)
      if (error) throw error
      return urlVisitorIds
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to bulk delete url visitors')
    }
  }
)

const urlVisitorsSlice = createSlice({
  name: 'urlVisitors',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUrlVisitors.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUrlVisitors.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUrlVisitors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(updateUrlVisitor.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUrlVisitor.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          const updatedUrlVisitor = action.payload as UrlVisitor
          const index = state.data.findIndex(u => u.id === updatedUrlVisitor.id)
          if (index !== -1) {
            state.data[index] = updatedUrlVisitor
          }
        }
      })
      .addCase(updateUrlVisitor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(deleteUrlVisitor.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUrlVisitor.fulfilled, (state, action) => {
        state.loading = false
        state.data = state.data.filter(u => u.id !== action.payload)
      })
      .addCase(deleteUrlVisitor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(bulkDeleteUrlVisitors.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkDeleteUrlVisitors.fulfilled, (state, action) => {
        state.loading = false
        const idsToDelete = action.payload
        state.data = state.data.filter(u => !idsToDelete.includes(u.id))
      })
      .addCase(bulkDeleteUrlVisitors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default urlVisitorsSlice.reducer
