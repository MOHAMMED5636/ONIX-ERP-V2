import React from 'react';

const LeaveBalanceCard = ({ type, balance }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 capitalize">
          {type.replace(/([A-Z])/g, ' $1').trim()} Leave
        </h3>
        <span className="text-xs text-gray-500">{balance.used}/{balance.total}</span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Remaining</span>
          <span className="font-semibold text-gray-900">{balance.remaining} days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
