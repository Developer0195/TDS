import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import WeeklyTasksReviewPage from "../../components/WeeklyTaskReview";

const SuperAdminWeeklyTasks = () => {
  const { userId } = useParams();
  console.log(userId)

  return (
    <DashboardLayout activeMenu="User Management">
      <WeeklyTasksReviewPage userId={userId} />
    </DashboardLayout>
  );
};

export default SuperAdminWeeklyTasks;
