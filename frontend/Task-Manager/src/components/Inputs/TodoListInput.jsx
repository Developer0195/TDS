import React, { useEffect, useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const TodoListInput = ({ disabled, todoList, setTodoList }) => {
    const [option, setOption] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [users, setUsers] = useState([]);

    /* ===============================
       FETCH USERS FOR SUBTASK ASSIGNMENT
    =============================== */
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
                setUsers(res.data.users || []);
            } catch (error) {
                console.log("Failed to load users", error);
            }
        };

        fetchUsers();
    }, []);

    /* ===============================
       ADD SUBTASK
    =============================== */
    const handleAddOption = () => {
        if (!option.trim()) return;

        const newSubtask = {
            text: option.trim(),
            assignedTo: assignedTo || null,
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
                        <option value="">Assign Member (Optional)</option>
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
