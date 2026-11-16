# TaskFlow -- Weekly To-Do List

TaskFlow is a full-stack task management application that helps users
organize tasks across the week. Users can create, view, edit, search,
complete, and delete tasks. Task data is stored in MongoDB and accessed
through a REST API.

## Live Links

-   **Live application:** https://heartfelt-maamoul-92ebbe.netlify.app/
-   **Backend API:** https://taskflow-backend-cy0v.onrender.com/
-   **Tasks API:** https://taskflow-backend-cy0v.onrender.com/api/tasks
-   **GitHub repository:** https://github.com/Mayor441/taskflow

## Features

-   Create tasks with a title, description, date, time, and priority.
-   View tasks in a weekly overview, organized from Monday to Sunday.
-   Edit and delete existing tasks.
-   Change task status between **In Progress** and **Completed**.
-   Search tasks by title or description.
-   View dashboard counts for total, in-progress, and completed tasks.
-   Persist task data in MongoDB Atlas.
-   Responsive frontend interface.

## Technology Stack

**Frontend:** React, Vite, Tailwind CSS, Axios, Lucide React, React Hot
Toast

**Backend:** Node.js, Express.js, Mongoose, MongoDB Atlas, CORS, dotenv

**Deployment:** Netlify (frontend), Render (backend), MongoDB Atlas
(database)

## Project Structure

``` text
taskflow/
├── backend/
│   ├── config/db.js
│   ├── controllers/taskController.js
│   ├── models/Task.js
│   ├── routes/taskRoutes.js
│   ├── .env                 # Create locally; do not commit
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── services/taskService.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Run Locally

### Prerequisites

-   Node.js and npm
-   MongoDB Atlas database or local MongoDB instance
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/Mayor441/taskflow.git
cd taskflow
```

### 2. Set up the backend

``` bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Replace the placeholder with your own MongoDB connection string. Never
commit the `.env` file or share database credentials.

Start the backend:

``` bash
npm run dev
```

The backend runs locally at `http://localhost:5000`.

### 3. Set up the frontend

Open a second terminal from the project root:

``` bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL shown by Vite, usually
`http://localhost:5173`.

Ensure `frontend/src/services/taskService.js` points to the backend you
want to use. For local development:

``` javascript
baseURL: 'http://localhost:5000/api/tasks'
```

For the deployed application:

``` javascript
baseURL: 'https://taskflow-backend-cy0v.onrender.com/api/tasks'
```

## REST API Endpoints

Base URL: `https://taskflow-backend-cy0v.onrender.com/api/tasks`

  Method   Endpoint              Description
  -------- --------------------- --------------------------------------
  POST     `/`                   Create a task
  GET      `/`                   Get all tasks
  GET      `/:id`                Get a task by ID
  PUT      `/:id`                Update a task
  PATCH    `/:id/status`         Update task status
  DELETE   `/:id`                Delete a task
  GET      `/search?q=keyword`   Search tasks by title or description

### Task Fields

-   `title` -- required task title
-   `description` -- optional description
-   `scheduledAt` -- required date and time
-   `priority` -- `Low`, `Medium`, or `High`
-   `status` -- `In Progress` or `Completed`

New tasks default to `Medium` priority and `In Progress` status when
those values are not supplied.

## Deployment

-   The frontend is deployed on Netlify and connected to the GitHub
    repository.
-   The backend is deployed on Render.
-   MongoDB Atlas stores the task records.
-   The backend's `MONGO_URI` is configured as an environment variable
    in Render.
-   The backend CORS configuration allows the deployed Netlify frontend
    and the local Vite development origin.

## Security Notes

-   Keep `.env` files and database credentials private.
-   Do not commit secrets to GitHub.
-   Use environment variables for deployment secrets.
-   Restrict database network access to the addresses and services you
    intend to allow.

## Author

Developed as a full-stack task management project using the MERN stack.
