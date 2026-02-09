import moment from "moment";

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "In Review": "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  OnHold: "bg-red-100 text-red-700",
};

const priorityStyles = {
  Low: "text-green-600",
  Medium: "text-orange-600",
  High: "text-red-600",
};

const TaskRow = ({ task, onClick }) => {
  const totalTodos = task.todoCheckList?.length || 0;
  const completedTodos = task.completedTodoCount || 0;

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-gray-300 hover:bg-gray-50 cursor-pointer text-sm"
    >
      {/* TASK NAME */}
      <div className="col-span-3 font-medium truncate">
        {task.title}
      </div>

      {/* STATUS */}
      <div className="col-span-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusStyles[task.status]
          }`}
        >
          {task.status}
        </span>
      </div>

      {/* PRIORITY */}
      <div className={`col-span-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
        {task.priority}
      </div>

      {/* SUBTASK STATUS */}
      <div className="col-span-2 text-xs text-gray-600">
        {completedTodos}/{totalTodos} done
      </div>

      {/* CREATED DATE */}
      <div className="col-span-1 text-xs text-gray-500">
        {moment(task.createdAt).format("DD MMM YYYY")}
      </div>

      {/* DUE DATE */}
      <div className="col-span-1 text-xs text-gray-500">
        {moment(task.dueDate).format("DD MMM YYYY")}
      </div>

      {/* ASSIGNED TO */}
      <div className="col-span-2 flex flex-wrap gap-2">
        {task.assignedTo?.slice(0, 3).map((u) => (
          <div
            key={u}
            className="w-10 h-7 px-2 py-1 rounded-lg bg-gray-200 text-xs flex items-center justify-center"
            title="Assigned user"
          >
            {u?.name}
          </div>
        ))}
        {task.assignedTo?.length > 3 && (
          <span className="text-xs text-gray-500">
            +{task.assignedTo.length - 3}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskRow;
