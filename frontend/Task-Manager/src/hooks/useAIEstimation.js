import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const useAIEstimation = ({ taskData }) => {
    const [loading, setLoading] = useState(false);
    const [estimation, setEstimation] = useState(null);

    const canEstimate =
        taskData.title &&
        taskData.description &&
        taskData.todoCheckList.length > 0 &&
        taskData.assignedTo.length > 0;

    const runEstimation = async () => {
        if (!canEstimate) {
            toast.error("Fill title, description, checklist and assignees first");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                checklistCount: taskData.todoCheckList.length,
                assignedTo: taskData.assignedTo,
                hasHistoricalData: false, // explicitly false (important)
            };

            const res = await axiosInstance.post(
                API_PATHS.TASKS.AI_ESTIMATE,
                payload
            );

            setEstimation(res.data);
        } catch (error) {
            console.error(error);
            toast.error("AI estimation failed");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        estimation,
        runEstimation,
        canEstimate,
    };
};

export default useAIEstimation;
