import React, { useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";  
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import moment from "moment"
import { addThousandsSeparator } from "../../utils/helper";

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

 return <DashboardLayout activeMenu="Dashboard">
  <div className="card my-5">
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
      label= "Total tasks "
      value= {addThousandsSeparator(
        dashboardData?.charts?.taskDistribution?.All || 0
      )}
      color= "bg-primary "
      />
       <InfoCard
      label= "Pending tasks "
      value= {addThousandsSeparator(
        dashboardData?.charts?.taskDistribution?.Pending || 0
      )}
      color= "bg-voilet-500"
      />
      <InfoCard
      label= "In Progress Tasks "
      value= {addThousandsSeparator(
        dashboardData?.charts?.taskDistribution?.InProgress || 0
      )}
      color= "bg-cyan-500"
      />
      <InfoCard
      label= "Completed tasks "
      value= {addThousandsSeparator(
        dashboardData?.charts?.taskDistribution?.Completed || 0
      )}
      color= "bg-lime-500"
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
  <div className="md:col-span-2">
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Recent Tasks</h5>

        <button className="card-btn" onClick={onSeeMore}>
          See all <LuArrowRight className="text-base" />
        </button>
      </div>

      <TaskListTable tableData={dashboardData?.recentTasks || []} />
    </div>
  </div>
</div>

</DashboardLayout>;
};

export default Dashboard;

