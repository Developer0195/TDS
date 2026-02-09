import React from "react";
import moment from "moment";

const statusStyles = {
  Pending: "bg-purple-100 text-purple-600",
  "In Progress": "bg-cyan-100 text-cyan-600",
  "In Review": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-600",
  Blocked: "bg-red-100 text-red-600",
};

const priorityStyles = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-orange-100 text-orange-600",
  Low: "bg-green-100 text-green-600",
};

const UserTaskListTable = ({ tasks = [] }) => {
  if (!tasks.length) {
    return (
      <p className="text-sm text-gray-400 mt-3">
        No tasks found for this user.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Task</th>
            <th className="px-4 py-3 text-left">Project</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Priority</th>
            <th className="px-4 py-3 text-left">Due Date</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr
              key={task._id}
              className="border-t border-gray-300 hover:bg-gray-50"
            >
              {/* TASK */}
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">
                  {task.title}
                </p>
                <p className="text-xs text-gray-400 truncate max-w-xs">
                  {task.description}
                </p>
              </td>

              {/* PROJECT */}
              <td className="px-4 py-3">
                {task.project?.name ? (
                  <span className="text-indigo-600 font-medium">
                    {task.project.name}
                  </span>
                ) : (
                  <span className="italic text-gray-400">
                    No Project
                  </span>
                )}
              </td>

              {/* STATUS */}
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusStyles[task.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.status}
                </span>
              </td>

              {/* PRIORITY */}
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    priorityStyles[task.priority] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.priority}
                </span>
              </td>

              {/* DUE DATE */}
              <td className="px-4 py-3">
                {task.dueDate
                  ? moment(task.dueDate).format("DD MMM YYYY")
                  : "—"}
              </td>

              {/* CREATED */}
              <td className="px-4 py-3 text-gray-500">
                {moment(task.createdAt).fromNow()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTaskListTable;
