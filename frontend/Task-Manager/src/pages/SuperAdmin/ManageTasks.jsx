import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import TaskRow from "../../components/TaskRow";

const ManageTasks = () => {
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);

  console.log("Assignable users:", assignableUsers);




  const today = new Date().toISOString().split("T")[0];

  // task filters
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    status: "",
    projectId: "",
    createdBy: "",
  });

  useEffect(() => {
    filters.endDate = filters.startDate
  }, [filters.startDate])

  const fetchAssignableUsers = async () => {
  try {
    const res = await axiosInstance.get(
      API_PATHS.USERS.GET_ASSIGNABLE_USERS
    );
    setAssignableUsers(res.data.users || []);
  } catch (error) {
    console.log("Failed to fetch assignable users", error);
  }
};


  // pagination
  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [pagination, setPagination] = useState(null);

  // ✅ Selected Project Filter
  const [selectedProject, setSelectedProject] = useState("ALL");

  const navigate = useNavigate();

  /* ---------------- TASK CLICK ---------------- */
  const handleClick = (taskData) => {
    navigate(`/superadmin/create-task`, { state: { taskId: taskData._id } });
  };

  /* ---------------- FETCH PROJECTS ---------------- */
  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECTS);
      setProjects(res.data.projects || []);
    } catch (error) {
      console.log("Failed to fetch projects", error);
    }
  };

  /* ---------------- FETCH TASKS ---------------- */
  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: filters.status,
          projectId: filters.projectId,
          createdBy: filters.createdBy,
          page,
          limit: PAGE_SIZE,
        },
      });

      setAllTasks(res.data.tasks || []);
      setPagination(res.data.pagination);
    } catch (error) {
      console.log("Failed to fetch tasks", error);
    }
  };

  console.log(allTasks);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchProjects();
    fetchAssignableUsers()
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters, page]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        {/* ---------------- FILTERS ---------------- */}
        <div className="card p-4 mb-6">
          <h3 className="font-medium mb-3">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label className="text-xs text-gray-500">Due Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-xs text-gray-500">Due End Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                value={filters.endDate}
                 min={filters.startDate || undefined}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="OnHold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="text-xs text-gray-500">Project</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                value={filters.projectId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, projectId: e.target.value }))
                }
              >
                <option value="">All Projects</option>
                <option value="null">Loose Tasks</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

             <div>
    <label className="text-xs text-gray-500">Created By</label>
    <select
      className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
      value={filters.createdBy}
      onChange={(e) =>
        setFilters((prev) => ({ ...prev, createdBy: e.target.value }))
      }
    >
      <option value="">All Users</option>
      <option value="me">My Tasks</option>
      {assignableUsers.map((u) => (
        <option key={u._id} value={u._id}>
          {u.name}
        </option>
      ))}
    </select>
  </div>
          </div>
        </div>

        {/* ---------------- TASKS SECTION ---------------- */}
        <h2 className="text-xl font-medium mt-8 mb-4">
          {selectedProject === "ALL"
            ? "All Tasks"
            : selectedProject === "LOOSE"
              ? "Loose Tasks"
              : "Project Tasks"}
        </h2>

        {/* TASK LIST */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div className="grid grid-cols-13 gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-300">
            <div className="col-span-3">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Subtasks</div>
            <div className="col-span-1">Created</div>
            <div className="col-span-1">Due</div>
            <div className="col-span-2">Assigned To</div>
             <div className="col-span-1">Assigned By</div>
          </div>

          {/* Rows */}
          {allTasks.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No tasks found.</p>
          ) : (
            allTasks.map((item) => (
              <TaskRow
                key={item._id}
                task={item}
                onClick={() => handleClick(item)}
              />
            ))
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 mb-3 mx-3">
            <p className="text-xs text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalItems} tasks
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>

              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
