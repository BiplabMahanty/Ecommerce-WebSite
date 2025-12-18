import React,{useState ,useEffect} from "react";

export default function DashboardPage() {

    const leaveTypes = ["employee", "admin", "leavePending",];
    return (

       <div className="p-6 w-full ">
       <div className="flex items-center justify-between mb-6">
  {/* Left: Page Title */}
  <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>

  {/* Right: Profile */}
  <div className="flex items-center gap-3 cursor-pointer">
    

    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
      B
    </div>
  </div>
</div>

        {/* <div className="p-2 w-10 h-10 display-flex text-left justify-top-left textalign-left">profile</div> */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cursor-pointer display-flex text-center justify-center textalign-center">
        {leaveTypes.map((type) => (
          <div
            key={type}
            value={type}
            className="bg-white p-6 rounded-2xl shadow border hover:shadow-lg cursor-pointer"
           
          >
            <h2 className="text-xl font-semibold mb-2 cursor-pointer" >{type} Leave</h2>
            <p className="text-gray-600">Policy based leave type</p>
          </div>
        ))}
      </div>
       
       </div>
    );
}