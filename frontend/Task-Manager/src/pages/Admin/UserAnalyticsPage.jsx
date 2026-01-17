import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import InfoCard from "../../components/Cards/InfoCards";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import TaskListTable from "../../components/TaskListTable";
import { addThousandsSeparator } from "../../utils/helper";

const COLORS = ["#8D51FF", "#00B8D8", "#7BCE00", "#EF4444"];

const UserAnalyticsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ---------------- FETCH USER BASIC INFO ---------------- */
    const fetchUserDetails = async () => {
        const res = await axiosInstance.get(
            API_PATHS.USERS.GET_USER_BY_ID(id)
        );
        setUser(res.data);
    };

    /* ---------------- FETCH USER ANALYTICS ---------------- */
    const fetchUserAnalytics = async () => {
        const res = await axiosInstance.get(
            API_PATHS.TASKS.GET_USER_ANALYTICS(id)
        );

        console.log("Here are data")
        console.log(res.data)

        setAnalyticsData(res.data);
        prepareChartData(res.data.charts);
    };

    /* ---------------- PREPARE CHART DATA ---------------- */
    const prepareChartData = (charts) => {
        const dist = charts?.taskDistribution || {};
        const priority = charts?.taskPriorityLevels || {};



        setPieChartData([
            { status: "Pending", count: dist.Pending || 0 },
            { status: "In Progress", count: dist.InProgress || 0 },
            { status: "Completed", count: dist.Completed || 0 },
            { status: "Blocked", count: dist.Blocked || 0 },
        ]);

        setBarChartData([
            { priority: "Low", count: priority.Low || 0 },
            { priority: "Medium", count: priority.Medium || 0 },
            { priority: "High", count: priority.High || 0 },
        ]);
    };

    /* ---------------- INIT ---------------- */
    useEffect(() => {
        const init = async () => {
            try {
                await Promise.all([
                    fetchUserDetails(),
                    fetchUserAnalytics(),
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [id]);

    /* ---------------- STATES ---------------- */
    if (loading) {
        return (
            <DashboardLayout activeMenu="Team Members">
                <p className="mt-6">Loading...</p>
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

    const stats = analyticsData?.statistics || {};

    return (
        <DashboardLayout activeMenu="Team Members">
            <div className="card my-5 p-3">
                <div>
                    <div className="col-span-3">
                        {/* BACK */}
                        <button
                            onClick={() => navigate(-1)}
                            className="text-sm text-gray-500 mb-4 hover:underline"
                        >
                            ← Back
                        </button>
                        <h2 className="text-xl font-semibold mb-2">
                            {user.name} — Analytics
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <Info label="Email" value={user.email} />
                            <Info label="Role" value={user.role} />
                            <Info label="Phone" value={user.phone || "—"} />
                            <Info label="Skills" value={user.skills?.join(", ") || "—"} />
                        </div>

                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5 ">
                    <InfoCard
                        label="Total tasks "
                        value={addThousandsSeparator(
                            stats.totalTasks || 0
                        )}
                        color="bg-primary "
                    />
                    <InfoCard
                        label="Pending tasks "
                        value={addThousandsSeparator(
                            stats.pendingTasks || 0
                        )}
                        color="bg-[#8D51FF]"
                    />
                    <InfoCard
                        label="In Progress Tasks "
                        value={addThousandsSeparator(
                            stats.inProgressTasks || 0
                        )}
                        color="bg-cyan-500"
                    />
                    <InfoCard
                        label="Completed tasks "
                        value={addThousandsSeparator(
                            stats.completedTasks || 0
                        )}
                        color="bg-lime-500"
                    />
                </div>


            </div>


            <div className="mt-5">

                {/* CHARTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card px-3 py-2">
                        <h5 className="font-medium mb-2">Task Distribution</h5>
                        <CustomPieChart data={pieChartData} colors={COLORS} />
                    </div>

                    <div className="card px-3 py-2">
                        <h5 className="font-medium mb-2">Task Priority Levels</h5>
                        <CustomBarChart data={barChartData} />
                    </div>
                </div>

                {/* RECENT TASKS */}
                <div className="card mt-6 px-3 py-3">
                    <h5 className="text-lg mb-2 font-semibold">Recent Tasks</h5>
                    <TaskListTable tableData={analyticsData?.recentTasks || []} />
                </div>
            </div>
        </DashboardLayout>
    );
};

/* ---------------- SMALL COMPONENTS ---------------- */
const Info = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

export default UserAnalyticsPage;
