import React from "react";
import { NavLink } from "react-router-dom";

export default function LandingPage() {

    return (
        <div className="flex items-center justify-center h-screen bg-red gap-10">


            <div className="bg-gradient-to-r from-orange-100 to-orange-600 text-red p-10 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-4">
                    <div>
                         <NavLink to="/admin/login" end className="bg-gradient-to-r from-orange-100 to-orange-600 text-green  p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                            Admin
                         </NavLink>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-orange-600 text-red p-10 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-4">
                    <div>
                         <NavLink to="/employee/login" end className="bg-gradient-to-r from-orange-100 to-orange-600 text-green p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                            Employee
                         </NavLink>
                    </div>    
                </div>
            </div>

         </div>

     );

};