import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { tasksService } from '../services/api'

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await tasksService.list(params)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const fetchTaskById = createAsyncThunk('tasks/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await tasksService.getById(id)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    selectedTask: null,
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
    filters: { location: '', category: '' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
  },
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => { s.loading = true })
     .addCase(fetchTasks.fulfilled, (s, a) => {
       s.loading = false
       s.items = a.payload.tasks
       s.total = a.payload.total
       s.totalPages = a.payload.total_pages
     })
     .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(fetchTaskById.fulfilled, (s, a) => { s.selectedTask = a.payload })
  },
})

export const { setFilters } = taskSlice.actions
export default taskSlice.reducer
