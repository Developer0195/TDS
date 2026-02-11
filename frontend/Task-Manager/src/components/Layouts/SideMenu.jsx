import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";

const SideMenu = ({ activeMenu }) => {
  const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=User&background=CBD5E1&color=1E293B";

  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const handleClick = (item) => {
    if (item.path === "logout") {
      handleLogout();
    } else {
      navigate(item.path);
    }
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(
        user.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA
      );
    }
  }, [user]);

  // 🔹 Separate logout from rest
  const menuItems = sideMenuData.filter((i) => i.path !== "logout");
  const logoutItem = sideMenuData.find((i) => i.path === "logout");

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20 flex flex-col">
      
      {/* ================= PROFILE ================= */}
      <div className="flex flex-col items-center py-3 border-b border-gray-200">
        <img
          src={user?.profileImageUrl || DEFAULT_AVATAR}
          alt="Profile"
          onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
          className="w-20 h-20 rounded-full"
        />

        {user?.role === "admin" && (
          <span className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-2">
            Admin
          </span>
        )}

        <h5 className="text-gray-900 font-medium mt-3">
          {user?.name}
        </h5>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>

      {/* ================= MENU (SCROLLABLE) ================= */}
      <div className="flex-1 overflow-y-auto py-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 cursor-pointer ${
              activeMenu === item.label
                ? "text-primary bg-blue-50 border-r-4 border-primary"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        ))}
      </div>

      {/* ================= LOGOUT (SAME STYLE, STICKY) ================= */}
      {logoutItem && (
        <div className="">
          <button
            onClick={() => handleClick(logoutItem)}
            className="w-full flex items-center gap-4 text-[15px] py-3 px-6 cursor-pointer font-semibold bg-blue-50"
          >
            <logoutItem.icon className="text-xl" />
            {logoutItem.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
