// import React, { useContext } from 'react'
// import SideMenu from './SideMenu';
// import Navbar from './Navbar';
// import { UserContext } from '../../context/userContext';

// const DashboardLayout = ({children, activeMenu}) => {
//     const {user} = useContext(UserContext);


//   return (
//     <div className="">
//       <Navbar activeMenu={activeMenu} />

//       {user && (
//         <div className="flex">
//           <div className="max-[1080px]:hidden">
//             <SideMenu activeMenu={activeMenu} />
//           </div>

//           <div className="grow mx-5">{children}</div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default DashboardLayout


import React, { useContext } from "react";
import SideMenu from "./SideMenu";
import Navbar from "./Navbar";
import { UserContext } from "../../context/userContext";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* NAVBAR */}
      <div className="sticky top-0 z-50 bg-white">
        <Navbar activeMenu={activeMenu} />
      </div>

      {user && (
        <div className="flex w-full">

          {/* SIDEBAR (Desktop Only) */}
          <div className="hidden lg:block lg:w-64 lg:shrink-0">
            <div className="sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
              <SideMenu activeMenu={activeMenu} />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
            {children}
          </div>

        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
