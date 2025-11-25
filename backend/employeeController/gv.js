import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Download, Filter, CheckCircle, XCircle } from 'lucide-react';

// Top Navigation Component
const TopNavigation = () => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-2xl">☰</div>
        <div className="relative">
          <input
            type="text"
            placeholder="All Candidates"
            className="bg-white text-gray-800 px-4 py-2 pr-10 rounded-md w-64"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span>1313</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
          <span>▼</span>
        </div>
      </div>
    </div>
  </div>
);

// Sidebar Component
const Sidebar = ({ activeMenu, setActiveMenu }) => (
  <div className="w-64 bg-white h-screen shadow-lg">
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-gray-600 text-sm mb-2">Dashboard</h2>
      </div>
      <div className="space-y-1">
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-medium">
          Leave Management
        </div>
        <div className="pl-8 space-y-1">
          <div 
            className={`py-1.5 cursor-pointer ${activeMenu === 'settings' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveMenu('settings')}
          >
            Leave Settings
          </div>
          <div 
            className={`py-1.5 cursor-pointer ${activeMenu === 'recall' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveMenu('recall')}
          >
            Leave Recall
          </div>
          <div 
            className={`py-1.5 cursor-pointer ${activeMenu === 'history' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveMenu('history')}
          >
            Leave History
          </div>
          <div 
            className={`py-1.5 cursor-pointer ${activeMenu === 'relief' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={() => setActiveMenu('relief')}
          >
            Relief Officers
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modal Components
const RecallModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Leave Recall Activation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Do you want to activate Leave Recall for this plan?</p>
        <select className="w-full border border-gray-300 rounded px-3 py-2 mb-4">
          <option>Select option from dropdown</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const BonusModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Leave Bonus</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Would you like to activate leave bonus</p>
        <select className="w-full border border-gray-300 rounded px-3 py-2 mb-4">
          <option>Select option from dropdown</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <p className="text-gray-600 mb-2">How much percentage of leave bonus?</p>
        <input 
          type="text" 
          placeholder="Percentage (%)" 
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const AllocationModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Leave Allocation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Select Leave Allocation</p>
        <select className="w-full border border-gray-300 rounded px-3 py-2 mb-4">
          <option>Senior Level</option>
          <option>Junior Level</option>
          <option>Mid Level</option>
        </select>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ReasonModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recall Reason</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Reason for Recall</p>
        <textarea 
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 h-24"
          placeholder="Enter reason..."
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ show, onClose, plan }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Leave Plan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Plan Name</label>
            <input type="text" defaultValue={plan?.name} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input type="number" defaultValue={plan?.duration} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carry Forward</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2">
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Carry Forward Days</label>
            <input type="number" defaultValue={plan?.maxCarry} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-600">Delete Leave Plan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Are you sure you want to delete this leave plan? This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignReliefModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Assign Relief Officer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2">
              <option>Select Employee</option>
              <option>John Smith (EMP001)</option>
              <option>Sarah Johnson (EMP002)</option>
              <option>Mike Davis (EMP003)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relief Officer</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2">
              <option>Select Relief Officer</option>
              <option>Emily Brown (EMP004)</option>
              <option>David Wilson (EMP005)</option>
              <option>Lisa Anderson (EMP006)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
              <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
              <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

// Leave Settings Component
const LeaveSettings = ({ activeTab, setActiveTab, leavePlans, onActionClick }) => (
  <>
    <div className="border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button 
            className={`pb-2 font-medium ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Leave Settings
          </button>
          <button 
            className={`pb-2 font-medium ${activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Leave Settings
          </button>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} />
          Create
        </button>
      </div>
    </div>

    {activeTab === 'create' && (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Plan Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (days)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Plan Duration(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recall / Autorenew</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leavePlans.map((plan, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{plan.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{plan.duration}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{plan.durations}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{plan.recall} / {plan.autorenew}</td>
                <td className="px-6 py-4 text-sm">
                  <button 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => onActionClick(plan, index)}
                  >
                    Actions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {activeTab === 'manage' && (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Plan Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (days)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carry Forward</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Carry Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leavePlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{plan.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{plan.duration}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${plan.carryForward === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {plan.carryForward}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{plan.maxCarry}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => onActionClick(plan, 'edit')}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => onActionClick(plan, 'delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);

// Leave Recall Component
const LeaveRecall = ({ recallRequests }) => (
  <>
    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Leave Recall Requests</h2>
      <div className="flex gap-2">
        <button className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-50">
          <Filter size={18} />
          Filter
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700">
          <Download size={18} />
          Export
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emp ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recallRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{request.employee}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{request.empId}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{request.leavePlan}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{request.fromDate}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{request.toDate}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{request.days}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{request.reason}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                  request.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                {request.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button className="text-green-600 hover:text-green-800">
                      <CheckCircle size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <XCircle size={18} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

// Leave History Component
const LeaveHistory = ({ leaveHistory }) => (
  <>
    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Leave History</h2>
      <div className="flex gap-2">
        <button className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-50">
          <Filter size={18} />
          Filter
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700">
          <Download size={18} />
          Export
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emp ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leaveHistory.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{record.employee}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{record.empId}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{record.leavePlan}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{record.fromDate}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{record.toDate}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{record.days}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  record.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                  record.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{record.appliedDate}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{record.approvedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

// Relief Officers Component
const ReliefOfficers = ({ reliefOfficers, onAssignClick }) => (
  <>
    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Relief Officers</h2>
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700"
        onClick={onAssignClick}
      >
        <Plus size={18} />
        Assign Relief Officer
      </button>
    </div>
    