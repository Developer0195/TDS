import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/Layouts/DashboardLayout'
import { PRIORITY_DATA } from '../../utils/data'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import moment from "moment"
import { LuTrash2 } from "react-icons/lu"
import SelectDropdown from '../../components/Inputs/SelectDropdown'
import TodoListInput from '../../components/Inputs/TodoListInput'
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput'
import SelectUsers from '../../components/Inputs/SelectUsers'
import Input from '../../components/Inputs/Input'
import Modal from '../../components/Modal'
import DeleteAlert from '../../components/DeleteAlert'

const CreateTask = () => {

  const location = useLocation()
  const { taskId } = location.state || {}
  const navigate = useNavigate()

  /* -------------------- STATE -------------------- */

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    todoCheckList: [],
    attachments: []
  })

  const [currentTask, setCurrentTask] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiFile, setAiFile] = useState(null)                 // local file
  const [aiAttachment, setAiAttachment] = useState(null)     // cloudinary file

  /* -------------------- HELPERS -------------------- */

  const handleValueChange = (key, value) => {
    setTaskData((prev) => ({ ...prev, [key]: value }))
  }

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoCheckList: [],
      attachments: [],
    })
    setAiFile(null)
    setAiAttachment(null)
    setError(null)
  }

  const handleRemoveAIFile = () => {
    setAiFile(null)
    setAiAttachment(null)

    if (!taskId) {
      clearData()
    }
  }

  /* -------------------- CREATE TASK -------------------- */

  const createTask = async () => {
    setLoading(true)

    try {
      if (!taskData.dueDate || isNaN(new Date(taskData.dueDate).getTime())) {
        toast.error("Please select a valid due date")
        setLoading(false)
        return
      }

      const todoList = taskData.todoCheckList.map((item) =>
        typeof item === "string"
          ? { text: item, completed: false }
          : { text: item.text, completed: item.completed ?? false }
      )

      const payload = {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoCheckList: todoList,
        attachments: aiAttachment ? [aiAttachment] : [],
      }

      const response = await axiosInstance.post(
        API_PATHS.TASKS.CREATE_TASK,
        payload
      )

      if (response.status === 201) {
        toast.success("Task Created Successfully")
        clearData()
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error(error.response?.data?.message || "Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UPDATE TASK -------------------- */

  const updateTask = async () => {
    setLoading(true)

    try {
      if (!taskData.dueDate || isNaN(new Date(taskData.dueDate).getTime())) {
        toast.error("Please select a valid due date")
        setLoading(false)
        return
      }

      const todoList = taskData.todoCheckList.map((item) =>
        typeof item === "string"
          ? { text: item, completed: false }
          : { text: item.text, completed: item.completed ?? false }
      )

      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        {
          ...taskData,
          dueDate: new Date(taskData.dueDate).toISOString(),
          todoCheckList: todoList,
          attachments: aiAttachment
            ? [...taskData.attachments, aiAttachment]
            : taskData.attachments,
        }
      )

      toast.success("Task Updated Successfully")
      clearData()
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = () => {
    setError("")

    if (!taskData.title.trim()) return setError("Title is required.")
    if (!taskData.description.trim()) return setError("Description is required.")
    if (!taskData.dueDate) return setError("Due date is required.")
    if (taskData.assignedTo.length === 0)
      return setError("Task not assigned to any member")
    if (taskData.todoCheckList.length === 0)
      return setError("Add at least one todo task")

    taskId ? updateTask() : createTask()
  }

  /* -------------------- AI GENERATE -------------------- */

  const handleAIGenerate = async () => {
    if (!taskData.title && !aiFile) {
      toast.error("Enter a title or upload a file")
      return
    }

    try {
      setAiLoading(true)

      const formData = new FormData()
      formData.append("title", taskData.title)
      if (aiFile) formData.append("file", aiFile)

      const response = await axiosInstance.post(
        API_PATHS.TASKS.AI_GENERATE,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      const aiTask = response.data

      setTaskData((prev) => ({
        ...prev,
        title: aiTask.title,
        description: aiTask.description,
        priority: aiTask.priority,
        todoCheckList: aiTask.todoCheckList,
      }))

      if (aiTask.fileUrl) {
        setAiAttachment({
          url: aiTask.fileUrl,
          name: aiFile?.name || "AI Uploaded File",
        })
      }

      toast.success("Task generated using AI")
    } catch (error) {
      toast.error("AI generation failed")
    } finally {
      setAiLoading(false)
    }
  }

  /* -------------------- LOAD TASK -------------------- */

  useEffect(() => {
    if (!taskId) return

    const loadTask = async () => {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
      )

      const taskInfo = response.data
      setCurrentTask(taskInfo)

      setTaskData({
        title: taskInfo.title,
        description: taskInfo.description,
        priority: taskInfo.priority,
        dueDate: taskInfo.dueDate
          ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
          : null,
        assignedTo: taskInfo.assignedTo.map((u) => u._id),
        todoCheckList: taskInfo.todoCheckList.map((t) => t.text),
        attachments: taskInfo.attachments || [],
      })
    }

    loadTask()
  }, [taskId])


  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium ">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">
                  Task Title
                </label>

                <div className="flex items-center gap-3">
                  {/* 📎 FILE UPLOAD */}
                  <label className="text-xs cursor-pointer text-indigo-600 hover:underline">
                    📎 Upload File
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      hidden
                      onChange={(e) => setAiFile(e.target.files[0])}
                    />
                  </label>

                  {/* ✨ AI BUTTON */}
                  <button
                    onClick={handleAIGenerate}
                    disabled={aiLoading || (!taskData.title)}
                    className={`text-xs font-medium hover:underline ${aiLoading || (!aiFile && !taskData.title)
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600"
                      }`}
                  >
                    {aiLoading ? "Generating..." : "✨ Generate with AI"}
                  </button>

                </div>
              </div>

              <input
                placeholder="Create App UI"
                className="form-input mt-1"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />

              {/* 📄 FILE NAME PREVIEW */}
              {aiFile && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500">
                    Selected file: {aiFile.name}
                  </p>

                  <button
                    type="button"
                    onClick={handleRemoveAIFile}
                    className="text-xs text-red-500 hover:underline"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}


            </div>


            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                placeholder="Describe task"
                className="form-input"
                rows={4}
                value={taskData.description}
                onChange={({ target }) =>
                  handleValueChange("description", target.value)
                }
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>

                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) =>
                    handleValueChange("priority", value)
                  }
                  placeholder="Select Priority"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium  text-slate-600">
                  Due Date
                </label>

                <Input
                  placeholder="Create App UI"
                  className="form-input"
                  value={taskData.dueDate}
                  onChange={({ target }) =>
                    handleValueChange("dueDate", target.value)
                  }
                  type="date"
                />
              </div>

              <div className="col span-12 md:col-span-3">
                <label className="text-xs font-medium text-slate-600 ">
                  Assign To
                </label>
                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) => {
                    handleValueChange("assignedTo", value);
                  }}
                />
              </div>

            </div>

            <div className="mt-3">
              <label className="text-xs font-medium  text-slate-600">
                TODO Checklist
              </label>

              <TodoListInput
                todoList={taskData?.todoCheckList}
                setTodoList={(value) =>
                  handleValueChange("todoCheckList", value)
                }
              />
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium □text-slate-600">
                Add Attachments
              </label>

              <AddAttachmentsInput
                attachments={taskData?.attachments}
                setAttachments={(value) =>
                  handleValueChange("attachments", value)
                }
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}

            <div className="flex justify-end mt-7">
              <button
                className="add-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {taskId ? "UPDATE TASK" : "CREATE TASK"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={() => deleteTask()}
        />
      </Modal>

    </DashboardLayout>

  )
}

export default CreateTask
