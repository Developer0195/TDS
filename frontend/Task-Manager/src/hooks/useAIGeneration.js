import { useState } from "react";
import toast from "react-hot-toast";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";
// import { API_PATHS, axiosInstance } from "../utils/apiPaths";

const useAIGeneration = ({ setTaskData, taskId, clearData }) => {
    const [aiLoading, setAiLoading] = useState(false);
    const [aiFile, setAiFile] = useState(null);
    const [aiAttachment, setAiAttachment] = useState(null);

    const handleRemoveAIFile = () => {
        setAiFile(null);
        setAiAttachment(null);

        if (!taskId) {
            clearData();
        }
    };

    const handleAIGenerate = async (title) => {
        if (!title && !aiFile) {
            toast.error("Enter a title or upload a file");
            return;
        }

        try {
            setAiLoading(true);

            const formData = new FormData();
            formData.append("title", title);
            if (aiFile) formData.append("file", aiFile);

            const response = await axiosInstance.post(
                API_PATHS.TASKS.AI_GENERATE,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const aiTask = response.data;

            setTaskData((prev) => ({
                ...prev,
                title: aiTask.title,
                description: aiTask.description,
                priority: aiTask.priority,
                todoCheckList: aiTask.todoCheckList,
            }));

            if (aiTask.fileUrl) {
                setAiAttachment({
                    url: aiTask.fileUrl,
                    name: aiFile?.name || "AI Uploaded File",
                });
            }

            toast.success("Task generated using AI");
        } catch (error) {
            console.error(error);
            toast.error("AI generation failed");
        } finally {
            setAiLoading(false);
        }
    };

    return {
        aiLoading,
        aiFile,
        setAiFile,
        aiAttachment,
        setAiAttachment,
        handleAIGenerate,
        handleRemoveAIFile,
    };
};

export default useAIGeneration;
