import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import MembersChip from "../../components/MembersChip";

const ManageProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [pagination, setPagination] = useState(null);


  /* ---------------- FILTERS ---------------- */
  const [filters, setFilters] = useState({
    search: "",
    clientName: "",
    status: "",
    startDate: "",
  endDate: "",
  });

  /* ---------------- FETCH PROJECTS ---------------- */
  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get(
        API_PATHS.PROJECTS.GET_PROJECTS,
        { params: filters, page,
          limit: PAGE_SIZE,}
      );

      setProjects(res.data.projects || []);
      setPagination(res.data.pagination);
    } catch (error) {
      console.log("Failed to fetch projects", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters, page]);

  useEffect(() => {
  setPage(1);
}, [filters]);


  /* ---------------- CLICK HANDLER ---------------- */
  const handleProjectClick = (project) => {
    navigate("/superadmin/create-project", {
      state: { projectId: project._id },
    });
  };


  const formatDateDDMMYY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
};


  return (
    <DashboardLayout activeMenu="Manage Projects">
      <div className="my-5">
        {/* ---------------- FILTERS ---------------- */}
        <div className="card p-4 mb-6">
          <h3 className="font-medium mb-3">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-xs text-gray-500">Search</label>
              <input
                type="text"
                placeholder="Search project or client"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
              />
            </div>

            {/* Start Date */}
<div>
  <label className="text-xs text-gray-500">Created From</label>
  <input
    type="date"
    className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
    value={filters.startDate}
    onChange={(e) =>
      setFilters((prev) => ({ ...prev, startDate: e.target.value, endDate: e.target.value }))
    }
  />
</div>

{/* End Date */}
<div>
  <label className="text-xs text-gray-500">Created To</label>
  <input
    type="date"
    className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
    value={filters.endDate}
    onChange={(e) =>
      setFilters((prev) => ({ ...prev, endDate: e.target.value }))
    }
  />
</div>


            {/* Client */}
            <div>
              <label className="text-xs text-gray-500">Client</label>
              <input
                type="text"
                placeholder="Filter by client"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs"
                value={filters.clientName}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    clientName: e.target.value,
                  }))
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
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* ---------------- PROJECTS TABLE ---------------- */}
        <h2 className="text-xl font-medium mb-4">All Projects</h2>

        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-300">
            <div className="col-span-3">Project</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Members</div>
            <div className="col-span-2">Created</div>
          </div>

          {/* Rows */}
          {projects.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">
              No projects found.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                onClick={() => handleProjectClick(project)}
                className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-300 text-sm cursor-pointer hover:bg-gray-50"
              >
                {/* Project */}
                <div className="col-span-3">
                  <p className="font-medium text-gray-800">
                    {project.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {project.description}
                  </p>
                </div>

                {/* Client */}
                <div className="col-span-3 text-gray-700">
                  {project.clientName || "-"}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      project.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : project.status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Members */}
                <div className="col-span-2 text-gray-600">
                   <MembersChip members={project.members || []} />
                </div>

                {/* Created */}
                <div className="col-span-2 text-xs text-gray-500">
                  {formatDateDDMMYY(project.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageProjects;
