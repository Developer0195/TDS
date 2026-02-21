import React, { useEffect, useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const TodoListInput = ({ disabled, todoList, setTodoList, users }) => {
    console.log(users)
    const [option, setOption] = useState("");
    const [assignedTo, setAssignedTo] = useState("");

    /* ===============================
       ADD SUBTASK
    =============================== */
    const handleAddOption = () => {
        if (!option.trim() || !assignedTo){
            toast.error("Task Name cannot be empty and Task must be assigned to a member");
            return;
        }

        const newSubtask = {
            text: option.trim(),
            assignedTo: assignedTo,
            completed: false,
        };

        setTodoList([...todoList, newSubtask]);

        setOption("");
        setAssignedTo("");
    };

    /* ===============================
       DELETE SUBTASK
    =============================== */
    const handleDeleteOption = (index) => {
        const updatedArr = todoList.filter((_, idx) => idx !== index);
        setTodoList(updatedArr);
    };

    return (
        <div>
            {/* ===============================
          SUBTASK LIST DISPLAY
      =============================== */}
            {todoList &&
                todoList.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2"
                    >
                        <div>
                            <p className="text-xs text-black font-medium">
                                <span className="text-gray-400 font-semibold mr-2">
                                    {index < 9 ? `0${index + 1}` : index + 1}.
                                </span>
                                {item.text}
                            </p>

                            {/* ✅ Assigned User */}
                            <p className="text-[11px] text-gray-500 mt-1">
                                Assigned To:{" "}
                                {item.assignedTo
                                    ? users.find((u) => u._id === item.assignedTo)?.name
                                    : "Unassigned"}
                            </p>
                            {item?.document && (
  <div className="mt-2 flex items-center gap-2 text-[11px]">
    <a
      href={item.document.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 hover:underline flex items-center gap-1"
    >
      📎 {item.document.fileName}
    </a>
  </div>
)}
                        </div>

                        {/* DELETE BUTTON */}
                        {!disabled && (
                            <button
                                className="cursor-pointer"
                                onClick={() => handleDeleteOption(index)}
                            >
                                <HiOutlineTrash className="text-lg text-red-500" />
                            </button>
                        )}
                    </div>
                ))}

            {/* ===============================
          ADD SUBTASK INPUTS
      =============================== */}
            {!disabled && (
                <div className="mt-4 space-y-3">
                    {/* Subtask Text */}
                    <input
                        type="text"
                        placeholder="Enter Subtask"
                        value={option}
                        onChange={(e) => setOption(e.target.value)}
                        className="w-full text-[13px] outline-none bg-white border border-gray-200 px-3 py-2 rounded-md"
                    />

                    {/* Assign Member */}
                    <select
  value={assignedTo}
  onChange={(e) => setAssignedTo(e.target.value)}
  className="w-full text-[13px] outline-none bg-white border border-gray-200 px-3 py-2 rounded-md"
>
  <option value="">Assign Member</option>

  {users.map((u) => (
    <option key={u._id} value={u._id}>
      {u.name}
    </option>
  ))}
</select>


                    {/* Add Button */}
                    <button
                        className="card-btn flex items-center gap-2"
                        onClick={handleAddOption}
                    >
                        <HiMiniPlus className="text-lg" />
                        Add Subtask
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodoListInput;
