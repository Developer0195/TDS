import React from "react";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  inProgress: "bg-blue-100 text-blue-800",
  inReview: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
};

const TaskStatusChips = ({ taskCounts = {} }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES.pending}`}>
        Pending: {taskCounts.pending || 0}
      </span>

      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES.inProgress}`}>
        In Progress: {taskCounts.inProgress || 0}
      </span>

      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES.inReview}`}>
        In Review: {taskCounts.inReview || 0}
      </span>

      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_STYLES.completed}`}>
        Completed: {taskCounts.completed || 0}
      </span>
    </div>
  );
};

export default TaskStatusChips;
