import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import TaskCard from "../../components/Cards/TaskCard";

const ManageTasks = () => {
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // ✅ Selected Project Filter
  const [selectedProject, setSelectedProject] = useState("ALL");

  const navigate = useNavigate();

  /* ---------------- TASK CLICK ---------------- */
  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
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
      let params = {};

      // ✅ Loose Tasks Filter
      if (selectedProject === "LOOSE") {
        params.projectId = "null";
      }

      // ✅ Specific Project Filter
      else if (selectedProject !== "ALL") {
        params.projectId = selectedProject;
      }

      const res = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params,
      });

      setAllTasks(res.data.tasks || []);
    } catch (error) {
      console.log("Failed to fetch tasks", error);
    }
  };

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedProject]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        {/* ---------------- PROJECT CARDS ---------------- */}
        <h2 className="text-xl font-medium mb-4">Projects</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* ✅ All Tasks Card */}
          <div
            onClick={() => setSelectedProject("ALL")}
            className={`p-4 rounded-xl border cursor-pointer shadow-sm ${
              selectedProject === "ALL"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-medium text-gray-800">📌 All Tasks</h3>
            <p className="text-xs text-gray-500">
              View tasks across all projects
            </p>
          </div>

          {/* ✅ Loose Tasks Card */}
          <div
            onClick={() => setSelectedProject("LOOSE")}
            className={`p-4 rounded-xl border cursor-pointer shadow-sm ${
              selectedProject === "LOOSE"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-medium text-gray-800">🗂 Loose Tasks</h3>
            <p className="text-xs text-gray-500">
              Tasks not tagged to any project
            </p>
          </div>

          {/* ✅ Project Cards */}
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => setSelectedProject(project._id)}
              className={`p-4 rounded-xl border cursor-pointer shadow-sm ${
                selectedProject === project._id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200"
              }`}
            >
              <h3 className="font-medium text-gray-800">
                {project.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {project.description || "No description"}
              </p>
            </div>
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allTasks.length === 0 ? (
            <p className="text-sm text-gray-400">
              No tasks found in this section.
            </p>
          ) : (
            allTasks.map((item) => (
              <TaskCard
                key={item._id}
                title={item.title}
                description={item.description}
                priority={item.priority}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                projectName={item.project?.name || ""}
                assignedTo={item.assignedTo?.map(
                  (u) => u.profileImageUrl
                )}
                attachmentCount={item.attachments?.length || 0}
                completedTodoCount={item.completedTodoCount || 0}
                todoChecklist={item.todoCheckList || []}
                onClick={() => handleClick(item)}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
