
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const taskRoutes = require('./routes/taskRoutes')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

//Task routes
app.use('/api/tasks', taskRoutes)

// Test API
app.get('/', (req, res) => {
  res.send('TaskFlow Backend API is running successfully!')
})

// Server port
const PORT = process.env.PORT || 5000

// Connect database and start server
const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()
