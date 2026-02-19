// export const BASE_URL = "https://tds-pc3j.onrender.com";
export const BASE_URL = "http://localhost:8000";
// utils/apiPaths.js
export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register", // Register a new user (Admin or Member)
        LOGIN: "/api/auth/login", // Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile", // Get logged-in user details
        UPDATE_PROFILE: "/api/auth/profile",
        VERIFY_EMAIL: "/api/auth/verify-email",
    },

    USERS: {
        GET_ALL_USERS: "/api/users", // Get all users (Admin only)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user by ID
        CREATE_USER: "/api/users", // Create a new user (Admin only)
        UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user details
        DELETE_USER: (userId) => `/api/users/${userId}`, // Delete a user
        GET_MY_PROFILE: "/api/users/me/profile",
        UPDATE_MY_PROFILE: "/api/users/me/profile",
        GET_ADMIN_TEAM: "/api/users/team",
        ADD_TEAM_MEMBER: "/api/users/team",
        REMOVE_TEAM_MEMBER: (id) => `/api/users/team/${id}`,
        SEARCH_USERS: "/api/users/search",
        GET_USER_ANALYTICS: (id) => `/api/users/${id}/analytics`,
        GET_ASSIGNABLE_USERS: "/api/users/assignable-users",
        GET_SUPERADMIN_USERS: "/api/users/superadmin"
    },

    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get Dashboard Data
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get User Dashboard Data
        GET_ALL_TASKS: "/api/tasks", // Get all tasks (Admin: all, User: only assigned)
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID
        CREATE_TASK: "/api/tasks", // Create a new task (Admin only)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task details
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete a task (Admin only)
        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update task status
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update task checklist
        AI_GENERATE: "/api/tasks/ai-generate",
        ADD_COMMENT: (taskId) => `/api/tasks/${taskId}/comments`,
        DELETE_COMMENT: (taskId, commentId) => `/api/tasks/${taskId}/comments/${commentId}`,
        GET_USER_ANALYTICS: (userId) => `/api/tasks/user/${userId}/analytics`,
        AI_ESTIMATE: "/api/tasks/ai/estimate",
        UPLOAD_SUBTASK_FILE: (taskId, subtaskId) =>
  `/api/tasks/${taskId}/subtasks/${subtaskId}/upload`,
         UPDATE_SUBTASK: (taskId, subtaskId) =>
        `/api/tasks/${taskId}/subtasks/${subtaskId}`,

    },

    WEEKLY_TASKS: {
        CREATE: "/api/weekly-tasks",
        UPDATE: (id) => `/api/weekly-tasks/${id}`,
        UPDATE_STATUS: (id) => `/api/weekly-tasks/${id}/status`,
        GET_MY_CURRENT: "/api/weekly-tasks/my/current",
        GET_BY_ID: (id) => `/api/weekly-tasks/${id}`,
        GET_MY_HISTORY: "/api/weekly-tasks/my/history",
        GET_BY_USER: (userId) => `/api/weekly-tasks/user/${userId}`,
        },


    LOCATIONS: {
  GET_ALL: "/api/locations",                 // Get all active locations (Admin)
  CREATE: "/api/locations",                  // Create a new location (Admin)
  DELETE: (locationId) => `/api/locations/${locationId}`, // Soft delete location
  ASSIGN: (userId) => `/api/locations/assign/${userId}`,  // Assign locations to user
},


    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks", // Download all tasks as an Excel file
        EXPORT_USERS: "/api/reports/export/users", // Download user-task report
    },

    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },
    ATTENDANCE: {
        PUNCH_IN: "/api/attendance/punch-in",
        PUNCH_OUT: "/api/attendance/punch-out",
        MY_ATTENDANCE: "/api/attendance/my",
        OFFSITE_CHECKIN: "/api/attendance/check-in",
        DAILY: "/api/attendance/daily",
        TEAM_ANALYTICS: "api/attendance/team/analytics",
        UPDATE_STATUS: (id) => `api/attendance/${id}/status`,
        ADMIN_OVERRIDE: "/api/attendance/admin/override",
    },
    PROJECTS: {
        CREATE_PROJECT: "/api/projects/create",
        GET_PROJECTS: "/api/projects",
        GET_PROJECT_BY_ID: (id) => `/api/projects/${id}`,
        UPDATE_PROJECT: (id) => `/api/projects/${id}`,
        DELETE_PROJECT: (id) => `/api/projects/${id}`,
      },
      
};
