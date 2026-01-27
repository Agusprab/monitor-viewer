import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createSupabaseClient } from '@/lib/supabase'

export interface Visitor {
  id: number
  name: string
  email: string
  no_tlp: string
  ip: string
  created_at: string
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
      .select('id,name,email,no_tlp,ip,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return (data || []).reverse()
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch visitors')
  }
})

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
  },
})

export default visitorsSlice.reducer
