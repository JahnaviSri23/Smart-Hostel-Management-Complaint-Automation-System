import React from 'react';

// Status badge for complaints
export const StatusBadge = ({ status }) => {
  const map = {
    open: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/50',
    in_progress: 'bg-blue-900/40 text-blue-400 border border-blue-800/50',
    resolved: 'bg-green-900/40 text-green-400 border border-green-800/50',
    closed: 'bg-gray-800 text-gray-400 border border-gray-700',
    rejected: 'bg-red-900/40 text-red-400 border border-red-800/50',
  };
  const labels = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' };
  return (
    <span className={`badge ${map[status] || 'bg-gray-800 text-gray-400'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
};

// Priority badge
export const PriorityBadge = ({ priority }) => {
  const map = {
    low: 'bg-gray-800 text-gray-400',
    medium: 'bg-blue-900/40 text-blue-400',
    high: 'bg-orange-900/40 text-orange-400',
    urgent: 'bg-red-900/40 text-red-400 animate-pulse-slow',
  };
  return <span className={`badge ${map[priority] || 'bg-gray-800 text-gray-400'}`}>{priority}</span>;
};

// Category badge
export const CategoryBadge = ({ category }) => {
  const map = {
    electricity: '⚡', plumbing: '🔧', internet: '📶', room: '🏠',
    furniture: '🪑', housekeeping: '🧹', security: '🔒', other: '📋'
  };
  return (
    <span className="badge bg-surface-hover border border-surface-border text-gray-300">
      {map[category] || '📋'} {category}
    </span>
  );
};

// Loading spinner
export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-600 border-t-transparent rounded-full animate-spin`} />
  );
};

// Loading state full page
export const LoadingState = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <Spinner size="lg" />
    <p className="text-gray-400 text-sm">{message}</p>
  </div>
);

// Empty state
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center">
      {Icon && <Icon className="w-8 h-8 text-gray-500" />}
    </div>
    <div>
      <h3 className="font-display font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
    {action}
  </div>
);

// Stat card
export const StatCard = ({ label, value, icon: Icon, color = 'brand', trend }) => {
  const colors = {
    brand: 'text-brand-400 bg-brand-900/30',
    green: 'text-green-400 bg-green-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
    red: 'text-red-400 bg-red-900/30',
    blue: 'text-blue-400 bg-blue-900/30',
    purple: 'text-purple-400 bg-purple-900/30',
  };
  return (
    <div className="card p-5 hover:border-surface-hover transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="font-display text-3xl font-bold text-white">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative card w-full ${sizes[size]} shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="font-display font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Select component
export const Select = ({ className = '', children, ...props }) => (
  <select className={`input ${className}`} {...props}>{children}</select>
);
