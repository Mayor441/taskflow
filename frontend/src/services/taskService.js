
import axios from 'axios'

// Backend API base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api/tasks',
})

// Get all tasks
export const getTasks = async () => {
  const response = await API.get('/')
  return response.data.tasks
}

// Get a single task
export const getTaskById = async (id) => {
  const response = await API.get(`/${id}`)
  return response.data.task
}

// Create a task
export const createTask = async (taskData) => {
  const response = await API.post('/', taskData)
  return response.data.task
}

// Update a task
export const updateTask = async (id, taskData) => {
  const response = await API.put(`/${id}`, taskData)
  return response.data.task
}

// Update task status
export const updateTaskStatus = async (id, status) => {
  const response = await API.patch(`/${id}/status`, {
    status,
  })
  return response.data.task
}

// Delete a task
export const deleteTask = async (id) => {
  const response = await API.delete(`/${id}`)
  return response.data
}

// Search tasks
export const searchTasks = async (query) => {
  const response = await API.get('/search', {
    params: { q: query },
  })
  return response.data.tasks
}
