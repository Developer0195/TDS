// import React, { useEffect, useState } from 'react'
// import DashboardLayout from '../../components/Layouts/DashboardLayout'
// import { useNavigate } from 'react-router-dom';
// import { API_PATHS } from '../../utils/apiPaths';
// import axiosInstance from '../../utils/axiosInstance';
// import { LuFileSpreadsheet } from 'react-icons/lu';
// import TaskCard from '../../components/Cards/TaskCard';
// import TaskStatusTabs from '../../components/TaskStatusTabs';

// const Mytasks = () => {

//   const [allTasks, setAllTasks] = useState([]);
//   const [tabs, setTabs] = useState([]);
//   const [filterStatus, setFilterStatus] = useState("ALL");

//   const navigate = useNavigate();

//   const handleClick = (taskId) => {
//     navigate(`/user/task-details/${taskId}`);
//   }

//   useEffect(() => {
//     getAllTasks(filterStatus);
//     return () => { };
//   }, [filterStatus]);


//   const getAllTasks = async () => {
//     try {
//       const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
//         params: {
//           status: filterStatus === "All" || filterStatus === "ALL" ? "" : filterStatus
//         }
//       });
//       setAllTasks(response.data?.tasks?.length > 0 ? response.data?.tasks : []);

//       //Map statusSummary data with fixed labels and order
//       const statusSummary = response.data?.statusSummary || {};
//       const statusArray = [
//         { label: "All", count: statusSummary.all || 0 },
//         { label: "Pending", count: statusSummary.pendingTasks || 0 },
//         { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
//         { label: "In Review", count: statusSummary.inReviewTasks || 0 },
//         { label: "Completed", count: statusSummary.completedTasks || 0 },
//         { label: "Blocked", count: statusSummary.blockedTasks || 0 },
//       ];


//       setTabs(statusArray)
//     } catch (error) {
//       console.log(error);
//     }
//   };


//   return (
//     <DashboardLayout activeMenu="My Tasks">
//       <div className="my-5">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between">
//           <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>

//           {tabs?.[0]?.count > 0 && (
//             <TaskStatusTabs
//               tabs={tabs}
//               activeTab={filterStatus}
//               setActiveTab={setFilterStatus}
//             />

//           )}

//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//           {allTasks?.map((item, index) => (
//             <TaskCard
//               key={item._id}
//               title={item.title}
//               description={item.description}
//               priority={item.priority}
//               status={item.status}
//               progress={item.progress}
//               createdAt={item.createdAt}
//               dueDate={item.dueDate}
//               assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
//               attachmentCount={item.attachments?.length || 0}
//               completedTodoCount={item.completedTodoCount || 0}
//               todoChecklist={item.todoCheckList || []}
//               onClick={() => {
//                 handleClick(item._id);
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </DashboardLayout>

//   )
// }

// export default Mytasks




import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import TaskRow from "../../components/UserTaskRow";
import moment from "moment-timezone";

const MyTasks = () => {
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // const today = new Date().toISOString().split("T")[0];
  const today = moment()
  .tz("Asia/Kolkata")
  .format("YYYY-MM-DD");

  /* ================= FILTERS ================= */
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    status: "",
    projectId: "",
  });

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [pagination, setPagination] = useState(null);

  const navigate = useNavigate();

  /* ---------------- TASK CLICK ---------------- */
  const handleClick = (task) => {
    navigate(`/user/task-details/${task._id}`);
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
          page,
          limit: PAGE_SIZE,
        },
      });

      setAllTasks(res.data.tasks || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      console.log("Failed to fetch tasks", error);
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters, page]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">

        {/* ---------------- FILTERS ---------------- */}
        <div className="card p-4 mb-6">
          <h3 className="font-medium mb-3">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Due Start */}
            <div>
              <label className="text-xs text-gray-500">Due Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, startDate: e.target.value, endDate: e.target.value }))
                }
              />
            </div>

            {/* Due End */}
            <div>
              <label className="text-xs text-gray-500">Due End Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                min={filters.startDate || undefined}
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, endDate: e.target.value }))
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
                  setFilters((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Blocked">Blocked</option>
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
                  setFilters((p) => ({ ...p, projectId: e.target.value }))
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
          </div>
        </div>

        {/* ---------------- TASK TABLE ---------------- */}
      {/* ---------------- TASK TABLE ---------------- */}
<div className="border border-gray-300 rounded-lg bg-white">
  <div className="w-full overflow-x-auto">
    {/* Force width wider than mobile */}
    <div className="min-w-[1100px]">

      {/* Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b">
        <div className="col-span-3 whitespace-nowrap">Task</div>
        <div className="col-span-2 whitespace-nowrap">Status</div>
        <div className="col-span-1 whitespace-nowrap">Priority</div>
        <div className="col-span-2 whitespace-nowrap">Subtasks</div>
        <div className="col-span-1 whitespace-nowrap">Created</div>
        <div className="col-span-1 whitespace-nowrap">Due</div>
        <div className="col-span-2 whitespace-nowrap">Assigned By</div>
      </div>

      {/* Rows */}
      {allTasks.length === 0 ? (
        <p className="p-4 text-sm text-gray-400">No tasks found.</p>
      ) : (
        allTasks.map((task) => (
          <TaskRow
            key={task._id}
            task={task}
            onClick={() => handleClick(task)}
          />
        ))
      )}

    </div>
  </div>
</div>


        {/* ---------------- PAGINATION ---------------- */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 mx-3">
            <p className="text-xs text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalItems} tasks
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 text-xs border rounded disabled:opacity-50"
              >
                Previous
              </button>

              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-xs border rounded disabled:opacity-50"
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

export default MyTasks;
