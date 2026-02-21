// import React from "react";
// import moment from "moment";

// const TaskListTable = ({ tableData }) => {
//   const getStatusBadgeColor = (status) => {
//     switch (status) {
//       case "Completed":
//         return "bg-green-100 text-green-500 border border-green-200";
//       case "Pending":
//         return "bg-purple-100 text-purple-500 border border-purple-200";
//       case "In Progress":
//         return "bg-cyan-100 text-cyan-500 border border-cyan-200";
//       case "In Review":
//         return "bg-yellow-100 text-yellow-600 border border-yellow-200";
//       case "Blocked":
//         return "bg-red-100 text-red-500 border border-red-200";
//       default:
//         return "bg-gray-100 text-gray-500 border border-gray-200";
//     }
//   };

//   const getPriorityBadgeColor = (priority) => {
//     switch (priority) {
//       case "High":
//         return "bg-red-100 text-red-500 border border-red-200";
//       case "Medium":
//         return "bg-orange-100 text-orange-500 border border-orange-200";
//       case "Low":
//         return "bg-green-100 text-green-500 border border-green-200";
//       default:
//         return "bg-gray-100 text-gray-500 border border-gray-200";
//     }
//   };

//   return (
//     <div className="overflow-x-auto p-0 rounded-lg mt-3">
//       <table className="min-w-full">
//         <thead>
//           <tr className="text-left">
//             {/* TASK NAME */}
//             <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
//               Name
//             </th>

//             {/* ✅ NEW PROJECT COLUMN */}
//             <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
//               Project
//             </th>

//             {/* STATUS */}
//             <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
//               Status
//             </th>

//             {/* PRIORITY */}
//             <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
//               Priority
//             </th>

//             {/* ASSIGNED TO */}
//             <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
//               Assigned By
//             </th>

//             {/* CREATED ON */}
//             <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
//               Created On
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {tableData.map((task) => (
//             <tr key={task._id} className="border-t border-gray-200">
//               {/* TASK TITLE */}
//               <td className="py-4 px-4 text-gray-700 text-[13px]">
//                 {task.title}
//               </td>

//               {/* PROJECT NAME */}
//               <td className="py-4 px-4 text-gray-600 text-[13px] md:table-cell">
//                 {task.project?.name ? (
//                   <span className="text-indigo-600 font-medium">
//                     {task.project.name}
//                   </span>
//                 ) : (
//                   <span className="text-gray-400 italic">No Project</span>
//                 )}
//               </td>

//               {/* STATUS */}
//               <td className="py-4 px-4">
//                 <span
//                   className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(
//                     task.status,
//                   )}`}
//                 >
//                   {task.status}
//                 </span>
//               </td>

//               {/* PRIORITY */}
//               <td className="py-4 px-4">
//                 <span
//                   className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(
//                     task.priority,
//                   )}`}
//                 >
//                   {task.priority}
//                 </span>
//               </td>

//               {/* Assigned to */}
//               <td>
//                 <div className="flex flex-wrap gap-1">
//                   {task.assignedTo?.map((user) => (
//                     <div
//                       key={user._id}
//                       className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
//                       title={user.email}
//                     >
//                       {user.name}
//                     </div>
//                   ))}
//                 </div>
//               </td>

//               {/* CREATED DATE */}
//               <td className="py-4 px-4 text-gray-700 text-[13px] hidden md:table-cell">
//                 {task.createdAt
//                   ? moment(task.createdAt).format("DD MMM YYYY")
//                   : "N/A"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TaskListTable;

import React from "react";
import moment from "moment-timezone";

const TaskListTable = ({ tableData }) => {
  console.log("called")
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-500 border border-green-200";
      case "Pending":
        return "bg-purple-100 text-purple-500 border border-purple-200";
      case "In Progress":
        return "bg-cyan-100 text-cyan-500 border border-cyan-200";
      case "In Review":
        return "bg-yellow-100 text-yellow-600 border border-yellow-200";
      case "Blocked":
        return "bg-red-100 text-red-500 border border-red-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-500 border border-red-200";
      case "Medium":
        return "bg-orange-100 text-orange-500 border border-orange-200";
      case "Low":
        return "bg-green-100 text-green-500 border border-green-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  return (
    <div className="overflow-x-auto p-2 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            {/* TASK NAME */}
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Name
            </th>

            {/* PROJECT */}
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Project
            </th>

            {/* STATUS */}
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Status
            </th>

            {/* PRIORITY */}
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Priority
            </th>

            {/* ASSIGNED BY */}
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Assigned By
            </th>

            {/* CREATED ON */}
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Created On
            </th>
          </tr>
        </thead>

        <tbody>
          {tableData.map((task) => (
            <tr key={task._id} className="border-t border-gray-200">
              {/* TASK TITLE */}
              <td className="py-4 px-4 text-gray-700 text-[13px]">
                {task.title}
              </td>

              {/* PROJECT NAME */}
              <td className="py-4 px-4 text-gray-600 text-[13px]">
                {task.project?.name ? (
                  <span className="text-indigo-600 font-medium">
                    {task.project.name}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">No Project</span>
                )}
              </td>

              {/* STATUS */}
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </td>

              {/* PRIORITY */}
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </td>

              {/* ASSIGNED BY */}
              <td className="py-4 px-4 hidden md:table-cell">
                {task.createdBy ? (
                  <div
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 inline-block"
                    title={task.createdBy.email}
                  >
                    {task.createdBy.name}
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-xs">
                    System
                  </span>
                )}
              </td>

              {/* CREATED DATE */}
              {/* <td className="py-4 px-4 text-gray-700 text-[13px] hidden md:table-cell">
                {task.createdAt
                  ? moment(task.createdAt).tz("Asia/Kolkata").format("DD MMM YYYY")
                  : "N/A"}
              </td> */}
              <td className="py-4 px-4 text-gray-700 text-[13px] ">
                              {task.createdAt
                                ? moment(task.createdAt)
                .tz("Asia/Kolkata")
                .format("DD MMM YYYY")
                                : "N/A"}
                            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;

