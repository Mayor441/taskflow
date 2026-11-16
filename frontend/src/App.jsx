
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  getTasks,
  searchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from './services/taskService'
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
} from 'lucide-react'

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

function formatTask(task) {
  const dateObject = new Date(task.scheduledAt)

  const year = dateObject.getFullYear()
  const month = String(dateObject.getMonth() + 1).padStart(2, '0')
  const date = String(dateObject.getDate()).padStart(2, '0')

  return {
    id: task._id,
    title: task.title,
    description: task.description || '',
    date: `${year}-${month}-${date}`,
    day: dateObject.toLocaleDateString('en-US', {
      weekday: 'long',
    }),
    time: dateObject.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    priority: task.priority,
    completed: task.status === 'Completed',
  }
}

function getWeekStart(dateString) {
  const date = new Date(`${dateString}T00:00:00`)

  const day = date.getDay()
  const difference = day === 0 ? -6 : 1 - day

  date.setDate(date.getDate() + difference)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayNumber = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${dayNumber}`
}

function groupTasksByWeek(tasks) {
  const groups = {}

  tasks.forEach((task) => {
    const weekStart = getWeekStart(task.date)

    if (!groups[weekStart]) {
      groups[weekStart] = []
    }

    groups[weekStart].push(task)
  })

  return Object.entries(groups)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
}


function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedWeeks, setExpandedWeeks] = useState({})
  const [searchText, setSearchText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'Medium',
  })
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true)

        const data = await getTasks()

        setTasks(data.map(formatTask))
        setError('')
      } catch (error) {
        console.error('Error fetching tasks:', error)

        setError('Unable to load tasks. Please check your backend.')
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])
  const filteredTasks = tasks.filter((task) =>
    `${task.title} ${task.description}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  )
  const completedTasks = tasks.filter((task) => task.completed).length

  const openTasks = tasks.length - completedTasks
  const weeklyGroups = groupTasksByWeek(filteredTasks)
  const toggleWeek = (weekStart) => {
    setExpandedWeeks((previous) => ({
      ...previous,
      [weekStart]: !previous[weekStart],
    }))
  }



  async function toggleTask(id) {
    const selectedTask = tasks.find(
      (task) => task.id === id
    )

    if (!selectedTask) return

    const newStatus = selectedTask.completed
      ? 'In Progress'
      : 'Completed'

    try {
      const updatedTask = await updateTaskStatus(
        id,
        newStatus
      )

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id
            ? formatTask(updatedTask)
            : task
        )
      )

      if (newStatus === 'Completed') {
        toast.success('Task completed successfully!')
      } else {
        toast.success('Task moved to In Progress!')
      }

    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error('Unable to update task status.')
    }
  }

  function handleEditClick(task) {
    setEditingTaskId(task.id)

    setFormData({
      title: task.title,
      description: task.description,
      date: task.date || '',
      time: task.date
        ? (() => {
          const [hours, minutes] = task.time.split(':')
          const [hour, period] = minutes.split(' ')
          const convertedHour = (
            (Number(hours) % 12) + (period === 'PM' ? 12 : 0)
          ).toString().padStart(2, '0')

          return `${convertedHour}:${hour}`
        })()
        : '',
      priority: task.priority,
    })

    setShowAddForm(true)
  }


  async function handleAddTask(event) {
    event.preventDefault()

    if (!formData.title.trim() || !formData.date || !formData.time) {
      return
    }

    try {
      const scheduledAt = new Date(
        `${formData.date}T${formData.time}:00`
      ).toISOString()

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scheduledAt,
        priority: formData.priority,
      }

      if (editingTaskId !== null) {
        const updatedTask = await updateTask(
          editingTaskId,
          taskData
        )

        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task.id === editingTaskId
              ? formatTask(updatedTask)
              : task
          )
        )

        toast.success('Task updated successfully!')
      } else {
        const newTask = await createTask(taskData)

        setTasks((previousTasks) => [
          ...previousTasks,
          formatTask(newTask),
        ])

        toast.success('Task created successfully!')
      }

      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        priority: 'Medium',
      })

      setEditingTaskId(null)
      setShowAddForm(false)

    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Unable to save task. Please try again.')
    }
  }



  async function handleDeleteTask(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmed) return

    try {
      await deleteTask(id)

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      )

      toast.success('Task deleted successfully!')

    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Unable to delete task. Please try again.')
    }
  }



  function getPriorityStyle(priority) {
    if (priority === 'High') {
      return 'bg-red-50 text-red-600'
    }

    if (priority === 'Medium') {
      return 'bg-orange-50 text-orange-600'
    }

    return 'bg-green-50 text-green-600'
  }

  return (
    <div className="min-h-screen bg-[#f8f7fc] px-4 py-6 sm:px-8">
      {loading && (
        <p className="mb-4 text-center text-purple-600">
          Loading tasks from MongoDB...
        </p>
      )}

      {error && (
        <p className="mb-4 text-center text-red-500">
          {error}
        </p>
      )}
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#29243f]">
              My Tasks
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Organize your week and stay productive.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingTaskId(null)
                setFormData({
                  title: '',
                  description: '',
                  date: '',
                  time: '',
                  priority: 'Medium',
                })
                setShowAddForm(true)
              }}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700"
            >
              <Plus size={18} />
              Add Task
            </button>

            <div className="rounded-2xl bg-purple-100 p-3 text-purple-700">
              <CalendarDays size={26} />
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <ClipboardList size={19} />
              <span className="text-sm">Total Tasks</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#29243f]">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-orange-500">
              <Clock size={19} />
              <span className="text-sm">In Progress</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#29243f]">
              {openTasks}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm sm:col-span-1">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={19} />
              <span className="text-sm">Completed</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#29243f]">
              {completedTasks}
            </p>
          </div>

        </section>


        {/* Search */}
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <Search size={20} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchText}
            onChange={async (event) => {
              const value = event.target.value
              setSearchText(value)

              if (value.trim() === '') {
                const data = await getTasks()
                setTasks(data.map(formatTask))
              } else {
                const data = await searchTasks(value)
                setTasks(data.map(formatTask))
              }
            }}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>


        {/* Weekly section */}
        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#29243f]">
                Weekly Overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your tasks from Monday to Sunday
              </p>
            </div>
          </div>

          {weeklyGroups.length === 0 ? (
            <p className="rounded-xl bg-white p-5 text-sm text-gray-400 shadow-sm">
              No tasks found.
            </p>
          ) : (
            <div className="space-y-4">

              {weeklyGroups.map(([weekStart, weekTasks]) => {
                const weekStartDate = new Date(`${weekStart}T00:00:00`)
                const weekEndDate = new Date(weekStartDate)
                weekEndDate.setDate(weekEndDate.getDate() + 6)

                const weekLabel =
                  `${weekStartDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} - ${weekEndDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}`

                const weekCompletedTasks = weekTasks.filter(
                  (task) => task.completed
                ).length

                const weekOpenTasks = weekTasks.length - weekCompletedTasks

                const isExpanded = expandedWeeks[weekStart] ?? true

                return (
                  <div
                    key={weekStart}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >

                    {/* Week header */}
                    <button
                      onClick={() => toggleWeek(weekStart)}
                      className="flex w-full items-center justify-between p-5 text-left hover:bg-purple-50"
                    >
                      <div>
                        <h3 className="font-semibold text-[#29243f]">
                          {weekLabel}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {weekOpenTasks} open · {weekCompletedTasks} completed
                        </p>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="text-purple-600" />
                      ) : (
                        <ChevronDown className="text-purple-600" />
                      )}
                    </button>

                    {/* Daily tasks */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5">

                        {weekDays.map((day) => {
                          const dayTasks = weekTasks.filter(
                            (task) => task.day === day
                          )

                          return (
                            <div key={day} className="mb-6 last:mb-0">

                              <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-semibold text-[#29243f]">
                                  {day}
                                </h4>

                                <span className="text-xs text-gray-400">
                                  {dayTasks.length} tasks
                                </span>
                              </div>

                              {dayTasks.length === 0 ? (
                                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
                                  No tasks scheduled
                                </p>
                              ) : (
                                <div className="space-y-3">

                                  {dayTasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className="flex items-start gap-3 rounded-xl border border-gray-100 p-4"
                                    >

                                      <button
                                        onClick={() => toggleTask(task.id)}
                                        className="mt-1 text-purple-600"
                                        aria-label={
                                          task.completed
                                            ? 'Mark as in progress'
                                            : 'Mark as completed'
                                        }
                                      >
                                        {task.completed ? (
                                          <CheckCircle2 size={21} />
                                        ) : (
                                          <Circle size={21} />
                                        )}
                                      </button>

                                      <div className="min-w-0 flex-1">

                                        <h5
                                          className={`font-medium ${task.completed
                                              ? 'text-gray-400 line-through'
                                              : 'text-[#29243f]'
                                            }`}
                                        >
                                          {task.title}
                                        </h5>

                                        <p className="mt-1 text-sm text-gray-500">
                                          {task.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">

                                          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                            {task.time}
                                          </span>

                                          <span
                                            className={`rounded-lg px-2 py-1 text-xs ${getPriorityStyle(task.priority)}`}
                                          >
                                            {task.priority} Priority
                                          </span>

                                          <span className="text-xs text-gray-400">
                                            {task.completed
                                              ? 'Completed'
                                              : 'In Progress'}
                                          </span>

                                        </div>

                                        <div className="mt-3 flex gap-3">

                                          <button
                                            onClick={() => handleEditClick(task)}
                                            className="text-sm font-medium text-purple-600 hover:text-purple-800"
                                          >
                                            Edit
                                          </button>

                                          <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="text-sm font-medium text-red-500 hover:text-red-700"
                                          >
                                            Delete
                                          </button>

                                        </div>

                                      </div>
                                    </div>
                                  ))}

                                </div>
                              )}

                            </div>
                          )
                        })}

                      </div>
                    )}

                  </div>
                )
              })}

            </div>
          )}

        </section>


        {/* Add Task Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <form
              onSubmit={handleAddTask}
              className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#29243f]">
                  {editingTaskId !== null ? 'Edit Task' : 'Add New Task'}
                </h2>

                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xl text-gray-500"
                >
                  ×
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-purple-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 p-3"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 p-3"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-600 p-3 font-semibold text-white hover:bg-purple-700"
              >
                {editingTaskId !== null ? 'Update Task' : 'Save Task'}
              </button>

            </form>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 pb-6 text-center text-sm text-gray-400">
          TaskFlow · Stay organized, stay productive.
        </footer>

      </div>
    </div>
  )
}

export default App
