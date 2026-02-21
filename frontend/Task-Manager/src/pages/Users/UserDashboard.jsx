// import React, { useEffect, useState } from "react";
// import { useUserAuth } from "../../hooks/useUserAuth";
// import { useContext } from "react";
// import { UserContext } from "../../context/userContext";
// import DashboardLayout from "../../components/Layouts/DashboardLayout";
// import { useNavigate } from "react-router-dom";
// import moment from "moment"
// import { addThousandsSeparator } from "../../utils/helper";
// import { API_PATHS } from "../../utils/apiPaths";
// import axiosInstance from "../../utils/axiosInstance";
// import InfoCard from "../../components/Cards/InfoCards";
// import TaskListTable from "../../components/TaskListTable";
// import CustomPieChart from "../../components/Charts/CustomPieChart";
// import CustomBarChart from "../../components/Charts/CustomBarChart";
// import { LuArrowRight } from "react-icons/lu";

// const COLORS = ['#8D51FF', '#00B8D8', '#7BCE00'];


// const UserDashboard = () => {
//   useUserAuth();

//   const { user } = useContext(UserContext);

//   const navigate = useNavigate();

//   const [dashboardData, setDashboardData] = useState(null);
//   const [pieChartData, setPieChartData] = useState([]);
//   const [barChartData, setBarChartData] = useState([]);

//   //Prepare chart data 
//   const prepareChartData = (data) => {
//     const taskDistribution = data?.taskDistribution || null;
//     const taskPriorityLevels = data?.taskPriorityLevels || null;

//     const taskDistributionData = [
//       { status: "Pending", count: taskDistribution?.Pending || 0 },
//       { status: "In Progress", count: taskDistribution?.InProgress || 0 },
//       { status: "Completed", count: taskDistribution?.Completed || 0 },
//     ];
//     const PriorityLevelData = [
//       { priority: "Low", count: taskPriorityLevels?.Low || 0 },
//       { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
//       { priority: "High", count: taskPriorityLevels?.High || 0 },
//     ];

//     setBarChartData(PriorityLevelData);
//     setPieChartData(taskDistributionData);
//   }


//   const getDashboardData = async () => {
//     try {
//       const response = await axiosInstance.get(
//         API_PATHS.TASKS.GET_USER_DASHBOARD_DATA
//       );
//       console.log("Here")
//       console.log(response)
//       if (response.data) {
//         setDashboardData(response.data);
//         prepareChartData(response.data?.charts || null)
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const onSeeMore = () => {
//     navigate('user/my-tasks')
//   }

//   useEffect(() => {
//     getDashboardData();
//     return () => { }
//   }, [])


//   return <DashboardLayout activeMenu="Dashboard">
//     <div className="card my-5">
//       <div>
//         <div className="col-span-3">
//           <h2 className="text-xl md:text-2xl">Good Morning! {user?.name}</h2>
//           <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
//             {moment().format("dddd Do MMM YYYY")}
//           </p>
//         </div>
//       </div>


//       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5 ">
//         <InfoCard
//           label="Total tasks "
//           value={addThousandsSeparator(
//             dashboardData?.charts?.taskDistribution?.All || 0
//           )}
//           color="bg-primary "
//         />
//         <InfoCard
//           label="Pending tasks "
//           value={addThousandsSeparator(
//             dashboardData?.charts?.taskDistribution?.Pending || 0
//           )}
//           color="bg-[#8D51FF]"
//         />
//         <InfoCard
//           label="In Progress Tasks "
//           value={addThousandsSeparator(
//             dashboardData?.charts?.taskDistribution?.InProgress || 0
//           )}
//           color="bg-cyan-500"
//         />
//         <InfoCard
//           label="Completed tasks "
//           value={addThousandsSeparator(
//             dashboardData?.charts?.taskDistribution?.Completed || 0
//           )}
//           color="bg-lime-500"
//         />
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">

//       <div>
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <h5 className="font-medium">Task Distribution</h5>
//           </div>

//           <CustomPieChart
//             data={pieChartData}
//             colors={COLORS}
//           />
//         </div>
//       </div>



//       <div>
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <h5 className="font-medium">Task Priority Levels</h5>
//           </div>

//           <CustomBarChart
//             data={barChartData}

//           />
//         </div>
//       </div>

//       <div className="md:col-span-2">
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <h5 className="text-lg">Recent Tasks</h5>

//             <button className="card-btn" onClick={onSeeMore}>
//               See all <LuArrowRight className="text-base" />
//             </button>
//           </div>

//           <TaskListTable tableData={dashboardData?.recentTasks || []} />
//         </div>
//       </div>
//     </div>

//   </DashboardLayout>;
// };

// export default UserDashboard;





import React, { useEffect, useState, useContext } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { addThousandsSeparator } from "../../utils/helper";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import InfoCard from "../../components/Cards/InfoCards";
import TaskListTable from "../../components/UserTaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import { LuArrowRight } from "react-icons/lu";
import moment from "moment-timezone";

const COLORS = [
  "#8D51FF", // Pending
  "#00B8D8", // In Progress
  "#FACC15", // In Review
  "#7BCE00", // Completed
];

const RECENT_TASKS_LIMIT = 10;

const UserDashboard = () => {
  console.log("called")
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [dueDateRange, setDueDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [createdDateRange, setCreatedDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [recentFilters, setRecentFilters] = useState({
    status: "",
    priority: "",
  });

  const [recentPage, setRecentPage] = useState(1);

  /* ================= RESET PAGE ON FILTER ================= */
  useEffect(() => {
    setRecentPage(1);
  }, [dueDateRange, createdDateRange, selectedProject, recentFilters]);

  /* ================= PREPARE CHART DATA ================= */
  const prepareChartData = (charts) => {
    const taskDistribution = charts?.taskDistribution || {};
    const taskPriorityLevels = charts?.taskPriorityLevels || {};

    setPieChartData([
      { status: "Pending", count: taskDistribution.Pending || 0 },
      { status: "In Progress", count: taskDistribution.InProgress || 0 },
      { status: "In Review", count: taskDistribution.InReview || 0 },
      { status: "Completed", count: taskDistribution.Completed || 0 },
    ]);

    setBarChartData([
      { priority: "Low", count: taskPriorityLevels.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels.Medium || 0 },
      { priority: "High", count: taskPriorityLevels.High || 0 },
    ]);
  };

  /* ================= FETCH DASHBOARD ================= */
  const getDashboardData = async () => {
    try {
      const res = await axiosInstance.get(
        API_PATHS.TASKS.GET_USER_DASHBOARD_DATA,
        {
          params: {
            projectId: selectedProject,

            dueStartDate: dueDateRange.startDate,
            dueEndDate: dueDateRange.endDate,

            createdStartDate: createdDateRange.startDate,
            createdEndDate: createdDateRange.endDate,

            recentStatus: recentFilters.status,
            recentPriority: recentFilters.priority,

            page: recentPage,
            limit: RECENT_TASKS_LIMIT,
          },
        }
      );

      if (res.data) {
        setDashboardData(res.data);
        prepareChartData(res.data.charts);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  /* ================= FETCH PROJECTS ================= */
  const getProjects = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECTS);
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error("Project fetch error:", error);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    getDashboardData();
  }, [
    recentPage,
    dueDateRange,
    createdDateRange,
    selectedProject,
    recentFilters,
  ]);

  useEffect(() => {
    getDashboardData();
    getProjects();
  }, []);

  /* ================= NAV ================= */
  const onSeeMore = () => {
    navigate("user/my-tasks");
  };

  /* ================= UI ================= */
  return (
    <DashboardLayout activeMenu="Dashboard">
      
      {/* DUE DATE FILTER */}
      <div className="card my-4 p-4 flex items-center justify-between">
        <div>
           <h4 className="font-medium">Filter by Due Date</h4>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2 text-xs"
            value={dueDateRange.startDate}
            onChange={(e) =>
              setDueDateRange((p) => ({ ...p, startDate: e.target.value }))
            }
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2 text-xs"
            min={dueDateRange.startDate || undefined}
            value={dueDateRange.endDate}
            onChange={(e) =>
              setDueDateRange((p) => ({ ...p, endDate: e.target.value }))
            }
          />
        </div>

        </div>
       


        <div className="">
        <h4 className="font-medium">Filter by Creation Date</h4>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2 text-xs"
            value={createdDateRange.startDate}
            onChange={(e) =>
              setCreatedDateRange((p) => ({
                ...p,
                startDate: e.target.value,
              }))
            }
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2 text-xs"
            min={createdDateRange.startDate || undefined}
            value={createdDateRange.endDate}
            onChange={(e) =>
              setCreatedDateRange((p) => ({
                ...p,
                endDate: e.target.value,
              }))
            }
          />
        </div>
      </div>
      </div>

      {/* CREATED DATE FILTER */}
      

      {/* HEADER */}
      <div className="card my-5 p-3">
        <h2 className="text-xl md:text-2xl">
          Good Morning! {user?.name}
        </h2>
        <p className="text-xs text-gray-400">
          {/* {moment().format("dddd Do MMM YYYY")} */}
          {moment().tz("Asia/Kolkata").format("dddd Do MMM YYYY")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />
          <InfoCard
            label="Pending"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-[#8D51FF]"
          />
          <InfoCard
            label="In Progress"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="In Review"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InReview || 0
            )}
            color="bg-yellow-500"
          />
          <InfoCard
  label="Completed"
  value={addThousandsSeparator(
    dashboardData?.charts?.taskDistribution?.Completed || 0
  )}
  color="bg-lime-500"
/>

        </div>
      </div>

      {/* PROJECT FILTER */}
      <div className="card my-4 p-4">
        <h4 className="font-medium">Filter by Project</h4>

        <select
          className="border border-gray-300 rounded px-3 py-2 text-xs w-full sm:w-72 mt-2"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">All Projects</option>
          <option value="null">Loose Tasks</option>

          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* CHARTS + RECENT TASKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <div className="card">
          <h5 className="font-medium mb-2">Task Distribution</h5>
          <CustomPieChart data={pieChartData} colors={COLORS} />
        </div>

        <div className="card">
          <h5 className="font-medium mb-2">Task Priority Levels</h5>
          <CustomBarChart data={barChartData} />
        </div>

        <div className="md:col-span-2 card">
          <div className="flex justify-between items-center mb-1 p-3">
            <h5 className="text-lg">Recent Tasks</h5>
          </div>

          <div className="flex gap-3 mb-3 p-3">
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-xs"
              value={recentFilters.status}
              onChange={(e) =>
                setRecentFilters((p) => ({ ...p, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-xs"
              value={recentFilters.priority}
              onChange={(e) =>
                setRecentFilters((p) => ({ ...p, priority: e.target.value }))
              }
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <TaskListTable tableData={dashboardData?.recentTasks || []} />

        
        </div>

        <div className = "md:col-span-2">
               {dashboardData?.recentTasksPagination && (
            <div className="flex justify-between mt-1 text-xs">
              <p>
                Page {dashboardData.recentTasksPagination.currentPage} of{" "}
                {dashboardData.recentTasksPagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={recentPage === 1}
                  onClick={() => setRecentPage((p) => p - 1)}
                  className="border border-gray-300 px-3 py-1 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={
                    recentPage ===
                    dashboardData.recentTasksPagination.totalPages
                  }
                  onClick={() => setRecentPage((p) => p + 1)}
                  className="border border-gray-300 px-3 py-1 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
         
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;


