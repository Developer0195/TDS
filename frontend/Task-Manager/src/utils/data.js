import {
    LuLayoutDashboard,
    LuUsers,
    LuClipboardCheck,
    LuSquarePlus,
    LuLogOut,
    LuMapPinCheckInside,
    LuFolderPlus
} from "react-icons/lu";

import { FaUser } from "react-icons/fa";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "Manage Tasks",
        icon: LuClipboardCheck,
        path: "/admin/tasks",
    },
    {
        id: "03",
        label: "Create Task",
        icon: LuSquarePlus,
        path: "/admin/create-task",
    },
    {
        id: "04",
        label: "Create Project",
        icon: LuFolderPlus,
        path: "/admin/create-project",
    },    
    {
        id: "05",
        label: "Team Members",
        icon: LuUsers,
        path: "/admin/users",
    },
    {
        id: "06",
        label: "Attendance",
        icon: LuMapPinCheckInside,
        path: "/attendance",
    },
    {
        id: "07",
        label: "Profile",
        icon: FaUser,
        path: "/profile",
    },
    {
        id: "08",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

export const SIDE_MENU_USER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/user/dashboard",
    },
    {
        id: "02",
        label: "My Tasks",
        icon: LuClipboardCheck,
        path: "/user/my-tasks",
    },
    {
        id: "03",
        label: "Attendance",
        icon: LuMapPinCheckInside,
        path: "/attendance",
    },
    {
        id: "04",
        label: "Profile",
        icon: FaUser,
        path: "/profile",
    },
    {
        id: "05",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

/* 🔽 THESE WERE MISSING — REQUIRED BY CreateTask.jsx */

export const PRIORITY_DATA = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
];

export const STATUS_DATA = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
];
