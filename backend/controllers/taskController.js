
const Task = require('../models/Task')

// 1. Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, scheduledAt, priority } = req.body

    if (!title || !title.trim() || !scheduledAt) {
      return res.status(400).json({
        message: 'Title and scheduled date/time are required',
      })
    }

    const task = await Task.create({
      title,
      description,
      scheduledAt,
      priority,
    })

    res.status(201).json({
      message: 'Task created successfully',
      task,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// 2. Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ scheduledAt: 1 })

    res.status(200).json({
      count: tasks.length,
      tasks,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// 3. Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      })
    }

    res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// 4. Update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      })
    }

    res.status(200).json({
      message: 'Task updated successfully',
      task,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// 5. Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!['In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid task status',
      })
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      })
    }

    res.status(200).json({
      message: 'Task status updated successfully',
      task,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// 6. Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      })
    }

    res.status(200).json({
      message: 'Task deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// 7. Search tasks
const searchTasks = async (req, res) => {
  try {
    const search = req.query.q || ''

    const tasks = await Task.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    }).sort({ scheduledAt: 1 })

    res.status(200).json({
      count: tasks.length,
      tasks,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  searchTasks,
}
