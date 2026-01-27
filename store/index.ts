import { configureStore } from '@reduxjs/toolkit'
import visitorsReducer from './visitorsSlice'
import urlVisitorsReducer from './urlVisitorsSlice'

export const store = configureStore({
  reducer: {
    visitors: visitorsReducer,
    urlVisitors: urlVisitorsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
