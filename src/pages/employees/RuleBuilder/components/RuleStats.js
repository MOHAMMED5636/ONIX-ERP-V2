import React from 'react';
import { 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  PencilIcon 
} from '@heroicons/react/24/outline';

const RuleStats = ({ stats }) => {
  const statCards = [
    {
      icon: ShieldCheckIcon,
      title: 'Total Rules',
      value: stats.totalRules,
      color: 'from-indigo-500 to-purple-500',
      textColor: 'text-gray-900'
    },
    {
      icon: CheckCircleIcon,
      title: 'Active Rules',
      value: stats.activeRules,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600'
    },
    {
      icon: XCircleIcon,
      title: 'Inactive Rules',
      value: stats.inactiveRules,
      color: 'from-gray-500 to-slate-500',
      textColor: 'text-gray-600'
    },
    {
      icon: EyeIcon,
      title: 'View Rules',
      value: stats.viewRules,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600'
    },
    {
      icon: PencilIcon,
      title: 'Edit Rules',
      value: stats.editRules,
      color: 'from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-gradient-to-r ${card.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{card.title}</p>
              <p className={`text-3xl font-black ${card.textColor}`}>{card.value}</p>
            </div>
          </div>
          <div className={`h-1 bg-gradient-to-r ${card.color} rounded-full`}></div>
        </div>
      ))}
    </div>
  );
};

export default RuleStats;


