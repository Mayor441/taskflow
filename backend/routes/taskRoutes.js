
const express = require('express')
const router = express.Router()

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks,
} = require('../controllers/taskController')

// Create task
router.post('/', createTask)

// Search tasks
router.get('/search', searchTasks)

// Get all tasks
router.get('/', getTasks)

// Get a single task
router.get('/:id', getTaskById)

// Update task
router.put('/:id', updateTask)

// Update task status
router.patch('/:id/status', updateTaskStatus)

// Delete task
router.delete('/:id', deleteTask)

module.exports = router

