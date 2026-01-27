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
  },
})

export default urlVisitorsSlice.reducer
