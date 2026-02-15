import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

import SelectUsers from "../../components/Inputs/SelectUsers";
import Input from "../../components/Inputs/Input";
import SelectDropdown from "../../components/Inputs/SelectDropdown";

import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";
import { LuTrash2 } from "react-icons/lu";

const PROJECT_STATUS = [
  { label: "Active", value: "Active" },
  { label: "Completed", value: "Completed" },
  { label: "On Hold", value: "On Hold" },
];

const CreateProject = () => {
  const location = useLocation();
  const { projectId } = location.state || {};

  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    clientName: "",
    status: "Active",
    members: [],
  });

  const [currentProject, setCurrentProject] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  /* ---------------- HELPERS ---------------- */

  const handleValueChange = (key, value) => {
    setProjectData((prev) => ({ ...prev, [key]: value }));
  };

  const clearData = () => {
    setProjectData({
      name: "",
      description: "",
      clientName: "",
      status: "Active",
      members: [],
    });
    setError("");
  };

  /* ---------------- CREATE PROJECT ---------------- */

  const createProject = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.PROJECTS.CREATE_PROJECT,
        projectData,
      );

      if (response.status === 201) {
        toast.success("Project Created Successfully");
        clearData();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE PROJECT ---------------- */

  const updateProject = async () => {
    setLoading(true);

    try {
      await axiosInstance.put(
        API_PATHS.PROJECTS.UPDATE_PROJECT(projectId),
        projectData,
      );

      toast.success("Project Updated Successfully");
      clearData();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE PROJECT ---------------- */

  const deleteProject = async () => {
    try {
      await axiosInstance.delete(API_PATHS.PROJECTS.DELETE_PROJECT(projectId));
      toast.success("Project Deleted Successfully");
      setOpenDeleteAlert(false);
      clearData();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = () => {
    setError("");

    if (!projectData.name.trim()) return setError("Project name is required.");
    if (!projectData.description.trim())
      return setError("Project description is required.");

    projectId ? updateProject() : createProject();
  };

  /* ---------------- LOAD PROJECT (EDIT MODE) ---------------- */

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      const response = await axiosInstance.get(
        API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId),
      );

      const projectInfo = response.data;

      setCurrentProject(projectInfo);

      setProjectData({
        name: projectInfo.name,
        description: projectInfo.description,
        clientName: projectInfo.clientName || "",
        status: projectInfo.status,
        members: projectInfo.members.map((m) => m._id),
      });
    };

    loadProject();
  }, [projectId]);

  return (
    <DashboardLayout activeMenu="Create Project">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">
                {projectId ? "Update Project" : "Create Project"}
              </h2>

              {projectId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            {/* PROJECT NAME */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Project Name
              </label>

              <Input
                placeholder="Enter project name"
                value={projectData.name}
                onChange={({ target }) =>
                  handleValueChange("name", target.value)
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                placeholder="Describe project"
                className="form-input"
                rows={4}
                value={projectData.description}
                onChange={({ target }) =>
                  handleValueChange("description", target.value)
                }
              />
            </div>

            {/* CLIENT NAME */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Client Name
              </label>

              <Input
                placeholder="Enter client name"
                value={projectData.clientName}
                onChange={({ target }) =>
                  handleValueChange("clientName", target.value)
                }
              />
            </div>

            {/* STATUS + MEMBERS */}
            <div className="grid grid-cols-12 gap-4 mt-3">
              {/* STATUS */}
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Status
                </label>

                <SelectDropdown
                  options={PROJECT_STATUS}
                  value={projectData.status}
                  onChange={(value) => handleValueChange("status", value)}
                  placeholder="Select Status"
                />
              </div>

              {/* MEMBERS */}
              <div className="col-span-12 md:col-span-6">
                <label className="text-xs font-medium text-slate-600">
                  Project Members
                </label>

                <SelectUsers
                  selectedUsers={projectData.members}
                  setSelectedUsers={(value) =>
                    handleValueChange("members", value)
                  }
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-xs font-medium text-red-500 mt-4">{error}</p>
            )}

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end mt-7">
              <button
                className="add-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {projectId ? "UPDATE PROJECT" : "CREATE PROJECT"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Project"
      >
        <DeleteAlert
          content="Are you sure you want to delete this project?"
          onDelete={deleteProject}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateProject;
