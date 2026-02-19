import { useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import InfoCard from "../../components/Cards/InfoCards";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";

const COLORS = [
  "#8D51FF", // Pending
  "#00B8D8", // In Progress
  "#FACC15", // In Review
  "#EF4444", // On Hold
  "#7BCE00", // Completed
];

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // for projects filters for kPI charts
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  // date range
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // recent tasks filters
  const [recentFilters, setRecentFilters] = useState({
    status: "",
    priority: "",
  });

  // pagination
  const [recentPage, setRecentPage] = useState(1);
  const RECENT_TASKS_LIMIT = 10;

  useEffect(() => {
    setRecentPage(1);
  }, [dateRange, selectedProject, recentFilters]);

  //Prepare chart data
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || {};
    const taskPriorityLevels = data?.taskPriorityLevels || {};

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution.Pending || 0 },
      { status: "In Progress", count: taskDistribution.InProgress || 0 },
      { status: "In Review", count: taskDistribution.InReview || 0 },
      { status: "On Hold", count: taskDistribution.OnHold || 0 },
      { status: "Completed", count: taskDistribution.Completed || 0 },
    ];

    const PriorityLevelData = [
      { priority: "Low", count: taskPriorityLevels.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels.Medium || 0 },
      { priority: "High", count: taskPriorityLevels.High || 0 },
    ];

    setPieChartData(taskDistributionData);
    setBarChartData(PriorityLevelData);
  };

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_DASHBOARD_DATA,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            projectId: selectedProject,
            recentStatus: recentFilters.status,
            recentPriority: recentFilters.priority,
            page: recentPage,
            limit: RECENT_TASKS_LIMIT,
          },
        },
      );

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // get all projects
  const getProjects = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECTS);
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, [recentPage, dateRange, selectedProject, recentFilters]);

  useEffect(() => {
    getDashboardData();
    getProjects();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      {/* date range ui */}

      <div className="card my-4 p-4">
        <h4 className="font-medium">Filter by Due Date</h4>
        <p className="text-xs text-gray-400 mb-3">
          Dashboard data updates based on selected date range
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-2 text-xs"
              value={dateRange.startDate}
              onChange={(e) => {
                const newStartDate = e.target.value;

                setDateRange((prev) => ({
                  startDate: newStartDate,
                  endDate: newStartDate, // reset end date automatically
                }));
              }}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-2 text-xs"
              value={dateRange.endDate}
              min={dateRange.startDate || undefined}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="card my-5 p-3">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">Good Morning! {user?.name}</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5 ">
          <InfoCard
            label="Total tasks "
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0,
            )}
            color="bg-primary "
          />
          <InfoCard
            label="Pending tasks "
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0,
            )}
            color="bg-[#8D51FF]"
          />
          <InfoCard
            label="In Progress Tasks "
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0,
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="In Review"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InReview || 0,
            )}
            color="bg-yellow-500"
          />

          <InfoCard
            label="On Hold"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.OnHold || 0,
            )}
            color="bg-red-500"
          />

          <InfoCard
            label="Completed tasks "
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0,
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      {/* project filters */}
      <div className="card my-4 p-4">
        <h4 className="font-medium">Filter by Project</h4>
        <p className="text-xs text-gray-400 mb-3">
          Dashboard data updates based on selected project
        </p>

        <select
          className="border border-gray-300 rounded px-3 py-2 text-xs w-full sm:w-72"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">All Projects</option>
          <option value="null">Loose Tasks (No Project)</option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Distribution</h5>
            </div>

            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Priority Levels</h5>
            </div>

            <CustomBarChart data={barChartData} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between p-3">
              <h5 className="text-lg">Recent Tasks</h5>

              {/* <button className="card-btn" onClick={onSeeMore}>
              See all <LuArrowRight className="text-base" />
            </button> */}
            </div>

            <div className="flex flex-wrap gap-3 mb-4 mx-3">
              {/* Status Filter */}
              <select
                className="border border-gray-300 rounded px-3 py-1.5 text-xs"
                value={recentFilters.status}
                onChange={(e) =>
                  setRecentFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="OnHold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                className="border border-gray-300 rounded px-3 py-1.5 text-xs"
                value={recentFilters.priority}
                onChange={(e) =>
                  setRecentFilters((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
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

          {/* pagination */}
          {dashboardData?.recentTasksPagination && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                Page {dashboardData.recentTasksPagination.currentPage} of{" "}
                {dashboardData.recentTasksPagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={recentPage === 1}
                  onClick={() => setRecentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 text-xs border rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  disabled={
                    recentPage ===
                    dashboardData.recentTasksPagination.totalPages
                  }
                  onClick={() => setRecentPage((p) => p + 1)}
                  className="px-3 py-1 text-xs border rounded disabled:opacity-50"
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

export default Dashboard;
