// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import DashboardLayout from "../../components/Layouts/DashboardLayout";
// import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPaths";

// import InfoCard from "../../components/Cards/InfoCards";
// import CustomPieChart from "../../components/Charts/CustomPieChart";
// import CustomBarChart from "../../components/Charts/CustomBarChart";
// import { addThousandsSeparator } from "../../utils/helper";
// import UserTaskListTable from "../../components/UserTaskListTable";


// const COLORS = ["#8D51FF", "#00B8D8", "#7BCE00", "#F59E0B", "#EF4444"];
// const PAGE_SIZE = 10;

// const UserAnalyticsPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [user, setUser] = useState(null);
//   const [analytics, setAnalytics] = useState(null);
//   const [pieChartData, setPieChartData] = useState([]);
//   const [barChartData, setBarChartData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   console.log(analytics)

//   /* ---------------- FILTERS ---------------- */
//   const [filters, setFilters] = useState({
//     startDate: "",
//     endDate: "",
//   });

//   /* ---------------- PAGINATION ---------------- */
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState(null);

//   /* ---------------- FETCH USER ---------------- */
//   const fetchUserDetails = async () => {
//     const res = await axiosInstance.get(
//       API_PATHS.USERS.GET_USER_BY_ID(id)
//     );
//     setUser(res.data);
//   };

//   /* ---------------- FETCH ANALYTICS ---------------- */
//   const fetchAnalytics = async () => {
//   const params = {
//     page,
//     limit: PAGE_SIZE,
//   };

//   if (filters.startDate && filters.endDate) {
//     params.startDate = filters.startDate;
//     params.endDate = filters.endDate;
//   }

//   const res = await axiosInstance.get(
//     API_PATHS.USERS.GET_USER_ANALYTICS(id),
//     { params }
//   );

//   setAnalytics(res.data);
//   setPagination(res.data.pagination);
//   prepareCharts(res.data.charts);
// };


//   /* ---------------- PREPARE CHART DATA ---------------- */
//   const prepareCharts = (charts = {}) => {
//     const dist = charts.taskDistribution || {};
//     const priority = charts.taskPriorityLevels || {};

//     setPieChartData([
//       { status: "Pending", count: dist.Pending || 0 },
//       { status: "In Progress", count: dist["In Progress"] || 0 },
//       { status: "Completed", count: dist.Completed || 0 },
//       { status: "In Review", count: dist["In Review"] || 0 },
//       { status: "On Hold", count: dist["On Hold"] || 0 },
//     ]);

//     setBarChartData([
//       { priority: "Low", count: priority.Low || 0 },
//       { priority: "Medium", count: priority.Medium || 0 },
//       { priority: "High", count: priority.High || 0 },
//     ]);
//   };

//   /* ---------------- INIT ---------------- */
//   useEffect(() => {
//     const init = async () => {
//       try {
//         setLoading(true);
//         await Promise.all([fetchUserDetails(), fetchAnalytics()]);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     init();
//   }, [id, page, filters]);

//   /* ---------------- UI STATES ---------------- */
//   if (loading) {
//     return (
//       <DashboardLayout activeMenu="Team Members">
//         <p className="mt-6">Loading analytics...</p>
//       </DashboardLayout>
//     );
//   }

//   if (!user) {
//     return (
//       <DashboardLayout activeMenu="Team Members">
//         <p className="mt-6">User not found</p>
//       </DashboardLayout>
//     );
//   }

//   const stats = analytics?.statistics || {};

//   return (
//     <DashboardLayout activeMenu="Team Members">
//       {/* HEADER */}
//       <div className="card my-5 p-4">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-sm text-gray-500 mb-3 hover:underline"
//         >
//           ← Back
//         </button>

//         <h2 className="text-xl font-semibold mb-3">
//           {user.name} — Analytics
//         </h2>

//         {/* USER INFO */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
//           <Info label="Email" value={user.email} />
//           <Info label="Role" value={user.role} />
//           <Info label="Phone" value={user.phone || "—"} />
//           <Info label="Skills" value={user.skills?.join(", ") || "—"} />
//         </div>

       

//         {/* KPI CARDS */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//           <InfoCard label="Total" value={stats.totalTasks || 0} />
//           <InfoCard label="Pending" value={stats.pendingTasks || 0} />
//           <InfoCard label="In Progress" value={stats.inProgressTasks || 0} />
//           <InfoCard label="Completed" value={stats.completedTasks || 0} />
//           <InfoCard label="In Review" value={stats.inReviewTasks || 0} />
//           <InfoCard label="On Hold" value={stats.onHoldTasks || 0} />
//         </div>
//       </div>

//        {/* FILTERS */}
//         <h1 className="text-sm font-medium text-gray-600 mb-1">
//   Filter by task due date
// </h1>

// <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
//   <div>
//     <label className="text-xs text-gray-500">
//       Start Date
//     </label>
//     <input
//       type="date"
//       className="form-input text-[11px] py-1 px-2 h-8"
//       value={filters.startDate}
//       onChange={(e) =>
//         setFilters((p) => ({ ...p, startDate: e.target.value }))
//       }
//     />
//   </div>

//   <div>
//     <label className="text-xs text-gray-500">
//       End Date
//     </label>
//     <input
//       type="date"
//       className="form-input text-[11px] py-1 px-2 h-8"
//       value={filters.endDate}
//       onChange={(e) =>
//         setFilters((p) => ({ ...p, endDate: e.target.value }))
//       }
//     />
//   </div>
// </div>


//       {/* CHARTS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card p-3">
//           <h5 className="font-medium mb-2">Task Distribution</h5>
//           <CustomPieChart data={pieChartData} colors={COLORS} />
//         </div>

//         <div className="card p-3">
//           <h5 className="font-medium mb-2">Task Priority</h5>
//           <CustomBarChart data={barChartData} />
//         </div>
//       </div>

//       {/* TASK LIST */}
//       <div className="card mt-6 p-3">
//         <h5 className="text-lg font-semibold mb-3">Recent Tasks</h5>

//         <UserTaskListTable tasks={analytics?.tasks || []} />


//         {/* PAGINATION */}
//         {pagination && pagination.totalPages > 1 && (
//           <div className="flex justify-between mt-4 text-xs">
//             <span>
//               Page {page} of {pagination.totalPages}
//             </span>

//             <div className="flex gap-2">
//               <button
//                 disabled={page === 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Prev
//               </button>
//               <button
//                 disabled={page === pagination.totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// /* ---------------- SMALL COMPONENT ---------------- */
// const Info = ({ label, value }) => (
//   <div>
//     <p className="text-xs text-gray-500">{label}</p>
//     <p className="text-sm font-medium">{value}</p>
//   </div>
// );

// export default UserAnalyticsPage;




// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import DashboardLayout from "../../components/Layouts/DashboardLayout";
// import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPaths";

// import InfoCard from "../../components/Cards/InfoCards";
// import CustomPieChart from "../../components/Charts/CustomPieChart";
// import CustomBarChart from "../../components/Charts/CustomBarChart";
// import UserTaskListTable from "../../components/AdminUserTaskListTable";

// const COLORS = ["#8D51FF", "#00B8D8", "#7BCE00", "#F59E0B", "#EF4444"];
// const PAGE_SIZE = 10;

// const UserAnalyticsPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [user, setUser] = useState(null);
//   const [analytics, setAnalytics] = useState(null);
//   const [pieChartData, setPieChartData] = useState([]);
//   const [barChartData, setBarChartData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   /* 🔹 Filters
//      - startDate, endDate → GLOBAL
//      - status, priority, assignedByMe → RECENT TASKS ONLY
//   */
//   const [filters, setFilters] = useState({
//     startDate: "",
//     endDate: "",
//     status: "",
//     priority: "",
//     assignedByMe: false,
//   });

//   /* ---------------- PAGINATION ---------------- */
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState(null);

//   /* ---------------- FETCH USER ---------------- */
//   const fetchUserDetails = async () => {
//     const res = await axiosInstance.get(
//       API_PATHS.USERS.GET_USER_BY_ID(id)
//     );
//     setUser(res.data);
//   };

//   /* ---------------- FETCH ANALYTICS ---------------- */
//   const fetchAnalytics = async () => {
//     const params = {
//       page,
//       limit: PAGE_SIZE,

//       // ✅ global filters
//       startDate: filters.startDate,
//       endDate: filters.endDate,

//       // ✅ recent tasks only
//       status: filters.status,
//       priority: filters.priority,
//       assignedByMe: filters.assignedByMe,
//     };

//     const res = await axiosInstance.get(
//       API_PATHS.USERS.GET_USER_ANALYTICS(id),
//       { params }
//     );

//     setAnalytics(res.data);
//     setPagination(res.data.pagination);
//     prepareCharts(res.data.charts);
//   };

//   /* ---------------- PREPARE CHARTS ---------------- */
//   const prepareCharts = (charts = {}) => {
//     const dist = charts.taskDistribution || {};
//     const priority = charts.taskPriorityLevels || {};

//     setPieChartData([
//       { status: "Pending", count: dist.Pending || 0 },
//       { status: "In Progress", count: dist["In Progress"] || 0 },
//       { status: "Completed", count: dist.Completed || 0 },
//       { status: "In Review", count: dist["In Review"] || 0 },
//       { status: "On Hold", count: dist["On Hold"] || 0 },
//     ]);

//     setBarChartData([
//       { priority: "Low", count: priority.Low || 0 },
//       { priority: "Medium", count: priority.Medium || 0 },
//       { priority: "High", count: priority.High || 0 },
//     ]);
//   };

//   /* ---------------- INIT ---------------- */
//   useEffect(() => {
//     const init = async () => {
//       try {
//         setLoading(true);
//         await Promise.all([fetchUserDetails(), fetchAnalytics()]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     init();
//   }, [id, page, filters]);

//   useEffect(() => {
//     setPage(1);
//   }, [filters]);

//   if (loading) {
//     return (
//       <DashboardLayout activeMenu="Team Members">
//         <p className="mt-6">Loading analytics...</p>
//       </DashboardLayout>
//     );
//   }

//   if (!user) {
//     return (
//       <DashboardLayout activeMenu="Team Members">
//         <p className="mt-6">User not found</p>
//       </DashboardLayout>
//     );
//   }

//   const stats = analytics?.statistics || {};

//   return (
//     <DashboardLayout activeMenu="Team Members">
//       {/* HEADER */}
//       <div className="card my-5 p-4">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-sm text-gray-500 mb-3 hover:underline"
//         >
//           ← Back
//         </button>

//         <h2 className="text-xl font-semibold mb-4">
//           {user.name} — Analytics
//         </h2>

//         {/* KPI CARDS */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//           <InfoCard label="Total" value={stats.totalTasks || 0} />
//           <InfoCard label="Pending" value={stats.pendingTasks || 0} />
//           <InfoCard label="In Progress" value={stats.inProgressTasks || 0} />
//           <InfoCard label="Completed" value={stats.completedTasks || 0} />
//           <InfoCard label="In Review" value={stats.inReviewTasks || 0} />
//           <InfoCard label="On Hold" value={stats.onHoldTasks || 0} />
//         </div>
//       </div>

//       {/* 🔹 GLOBAL DATE FILTER */}
//       <p className="text-sm text-gray-600 mb-1">
//         Filter by task due date
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
//         <input
//           type="date"
//           className="form-input text-xs h-8"
//           value={filters.startDate}
//           onChange={(e) =>
//             setFilters((p) => ({ ...p, startDate: e.target.value, endDate: e.target.value }))
//           }
//         />
//         <input
//           type="date"
//           className="form-input text-xs h-8"
//           value={filters.endDate}
//           onChange={(e) =>
//             setFilters((p) => ({ ...p, endDate: e.target.value }))
//           }
//         />
//       </div>

//       {/* CHARTS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card p-3">
//           <h5 className="font-medium mb-2">Task Distribution</h5>
//           <CustomPieChart data={pieChartData} colors={COLORS} />
//         </div>

//         <div className="card p-3">
//           <h5 className="font-medium mb-2">Task Priority</h5>
//           <CustomBarChart data={barChartData} />
//         </div>
//       </div>

//       {/* RECENT TASKS */}
//       <div className="card mt-6 p-3">
//         <h5 className="text-lg font-semibold mb-3">Recent Tasks</h5>

//         {/* 🔹 RECENT TASK FILTERS ONLY */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 items-center">
//           <select
//             className="text-xs py-2 px-1 border border-gray-300 rounded-lg"
//             value={filters.status}
//             onChange={(e) =>
//               setFilters((p) => ({ ...p, status: e.target.value }))
//             }
//           >
//             <option value="">All Status</option>
//             <option value="Pending">Pending</option>
//             <option value="In Progress">In Progress</option>
//             <option value="In Review">In Review</option>
//             <option value="Completed">Completed</option>
//             <option value="On Hold">On Hold</option>
//           </select>

//           <select
//             className="text-xs py-2 px-1 border border-gray-300 rounded-lg"
//             value={filters.priority}
//             onChange={(e) =>
//               setFilters((p) => ({ ...p, priority: e.target.value }))
//             }
//           >
//             <option value="">All Priority</option>
//             <option value="Low">Low</option>
//             <option value="Medium">Medium</option>
//             <option value="High">High</option>
//           </select>

//           <label className="flex items-center gap-2 text-xs text-gray-700">
//             <input
//               type="checkbox"
//               checked={filters.assignedByMe}
//               onChange={(e) =>
//                 setFilters((p) => ({
//                   ...p,
//                   assignedByMe: e.target.checked,
//                 }))
//               }
//             />
//             Assigned by me
//           </label>
//         </div>

//         <UserTaskListTable tableData={analytics?.tasks || []} />

//         {/* PAGINATION */}
//         {pagination && pagination.totalPages > 1 && (
//           <div className="flex justify-between mt-4 text-xs">
//             <span>
//               Page {page} of {pagination.totalPages}
//             </span>
//             <div className="flex gap-2">
//               <button
//                 disabled={page === 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Prev
//               </button>
//               <button
//                 disabled={page === pagination.totalPages}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default UserAnalyticsPage;



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import InfoCard from "../../components/Cards/InfoCards";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import UserTaskListTable from "../../components/AdminUserTaskListTable";

const COLORS = ["#8D51FF", "#00B8D8", "#7BCE00", "#F59E0B", "#EF4444"];
const PAGE_SIZE = 10;

const UserAnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDelayedModal, setShowDelayedModal] = useState(false);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    priority: "",
    assignedByMe: false,
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  /* ---------------- FETCH USER ---------------- */
  const fetchUserDetails = async () => {
    const res = await axiosInstance.get(
      API_PATHS.USERS.GET_USER_BY_ID(id)
    );
    setUser(res.data);
  };

  /* ---------------- FETCH ANALYTICS ---------------- */
  const fetchAnalytics = async () => {
    const params = {
      page,
      limit: PAGE_SIZE,
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status,
      priority: filters.priority,
      assignedByMe: filters.assignedByMe,
    };

    const res = await axiosInstance.get(
      API_PATHS.USERS.GET_USER_ANALYTICS(id),
      { params }
    );

    setAnalytics(res.data);
    setPagination(res.data.pagination);
    prepareCharts(res.data.charts);
  };

  /* ---------------- PREPARE CHARTS ---------------- */
  const prepareCharts = (charts = {}) => {
    const dist = charts.taskDistribution || {};
    const priority = charts.taskPriorityLevels || {};

    setPieChartData([
      { status: "Pending", count: dist.Pending || 0 },
      { status: "In Progress", count: dist["In Progress"] || 0 },
      { status: "Completed", count: dist.Completed || 0 },
      { status: "In Review", count: dist["In Review"] || 0 },
      { status: "On Hold", count: dist["On Hold"] || 0 },
    ]);

    setBarChartData([
      { priority: "Low", count: priority.Low || 0 },
      { priority: "Medium", count: priority.Medium || 0 },
      { priority: "High", count: priority.High || 0 },
    ]);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchUserDetails(), fetchAnalytics()]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, page, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Team Members">
        <p className="mt-6">Loading analytics...</p>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout activeMenu="Team Members">
        <p className="mt-6">User not found</p>
      </DashboardLayout>
    );
  }

  const stats = analytics?.statistics || {};
  const subtaskStats = stats.subtaskStatistics || {};

  return (
    <DashboardLayout activeMenu="Team Members">
      {/* HEADER */}
      <div className="card my-5 p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 mb-3 hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {user.name} — Analytics
        </h2>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <InfoCard label="Total" value={stats.totalTasks || 0} />
          <InfoCard label="Pending" value={stats.pendingTasks || 0} />
          <InfoCard label="In Progress" value={stats.inProgressTasks || 0} />
          <InfoCard label="Completed" value={stats.completedTasks || 0} />
          <InfoCard label="In Review" value={stats.inReviewTasks || 0} />
          <InfoCard label="On Hold" value={stats.onHoldTasks || 0} />
        </div>
      </div>

      {/* ================= ON-TIME COMPLETION MODULE ================= */}
      <div className="card my-6 p-5">
        <h3 className="text-lg font-semibold mb-4">
          Subtask Completion Performance
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          <InfoCard
            label="Subtasks Assigned"
            value={subtaskStats.totalSubtasksAssigned || 0}
          />

          <InfoCard
            label="Completed Subtasks"
            value={subtaskStats.completedSubtasks || 0}
          />

          <InfoCard
            label="On-Time"
            value={subtaskStats.onTimeSubtasks || 0}
          />

          {/* CLICKABLE DELAYED CARD */}
          <div
            onClick={() => setShowDelayedModal(true)}
            className="cursor-pointer hover:scale-105 transition"
          >
            <InfoCard
              label="Delayed"
              value={subtaskStats.delayedSubtasks || 0}
            />
          </div>

          <div className="card bg-white border rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">On-Time Rate</p>
            <p className="text-xl font-semibold text-blue-600">
              {subtaskStats.subtaskOnTimeRate || 0}%
            </p>
          </div>

        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-3">
          <h5 className="font-medium mb-2">Task Distribution</h5>
          <CustomPieChart data={pieChartData} colors={COLORS} />
        </div>

        <div className="card p-3">
          <h5 className="font-medium mb-2">Task Priority</h5>
          <CustomBarChart data={barChartData} />
        </div>
      </div>

      {/* RECENT TASKS */}
      <div className="card mt-6 p-3">
        <h5 className="text-lg font-semibold mb-3">Recent Tasks</h5>
        <UserTaskListTable tableData={analytics?.tasks || []} />
      </div>

      {/* ================= DELAYED SUBTASK MODAL ================= */}
      {showDelayedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDelayedModal(false)}
          />

          <div className="relative bg-white w-full max-w-3xl mx-4 rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Delayed Subtasks
              </h3>
              <button
                onClick={() => setShowDelayedModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {subtaskStats.delayedSubtaskDetails?.length === 0 ? (
              <p className="text-sm text-gray-500">
                No delayed subtasks 🎉
              </p>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50 text-xs text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Task</th>
                      <th className="px-3 py-2 text-left">Subtask</th>
                      <th className="px-3 py-2 text-left">Due Date</th>
                      <th className="px-3 py-2 text-left">Completed</th>
                      <th className="px-3 py-2 text-left">Delay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subtaskStats?.delayedSubtaskList?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.taskTitle}</td>
                        <td className="px-3 py-2">{item.subtaskText}</td>
                        <td className="px-3 py-2">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">
                          {new Date(item.completedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-red-600 font-medium">
                          {Math.round(item.delayMinutes / 60)} hrs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserAnalyticsPage;
