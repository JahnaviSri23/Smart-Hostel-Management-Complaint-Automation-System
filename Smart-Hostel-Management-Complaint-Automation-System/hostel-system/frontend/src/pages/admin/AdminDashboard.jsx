import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI, studentAPI, roomAPI } from '../../utils/api';
import { StatCard, StatusBadge, CategoryBadge, PriorityBadge, LoadingState } from '../../components/UI';
import {
  ClipboardDocumentListIcon, UsersIcon, BuildingOfficeIcon,
  ExclamationTriangleIcon, ClockIcon, CheckCircleIcon,
  WrenchScrewdriverIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#5c6ef3', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({ students: 0, rooms: 0, staff: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, studentsRes, roomsRes, staffRes] = await Promise.all([
          complaintAPI.getStats(),
          studentAPI.getAll({ limit: 1 }),
          roomAPI.getAll(),
          studentAPI.getMaintenanceStaff(),
        ]);
        setStats(statsRes.data.data);
        setCounts({
          students: studentsRes.data.total || 0,
          rooms: roomsRes.data.total || 0,
          staff: staffRes.data.data?.length || 0,
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const statusData = stats?.statusStats?.map(s => ({
    name: s._id.replace('_', ' '),
    value: s.count
  })) || [];

  const categoryData = stats?.categoryStats?.map(s => ({
    name: s._id,
    count: s.count
  })) || [];

  const statusMap = {};
  stats?.statusStats?.forEach(s => { statusMap[s._id] = s.count; });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="page-header">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of hostel management system</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={stats?.total || 0} icon={ClipboardDocumentListIcon} color="brand" />
        <StatCard label="Open" value={statusMap['open'] || 0} icon={ExclamationTriangleIcon} color="yellow" />
        <StatCard label="In Progress" value={statusMap['in_progress'] || 0} icon={ClockIcon} color="blue" />
        <StatCard label="Resolved" value={statusMap['resolved'] || 0} icon={CheckCircleIcon} color="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={counts.students} icon={UsersIcon} color="purple" />
        <StatCard label="Total Rooms" value={counts.rooms} icon={BuildingOfficeIcon} color="brand" />
        <StatCard label="Maintenance Staff" value={counts.staff} icon={WrenchScrewdriverIcon} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status pie */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-white mb-4">Complaints by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#4b5563' }}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#181c27', border: '1px solid #252a38', borderRadius: 12, color: '#f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-10">No data</p>}
        </div>

        {/* Category bar */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-white mb-4">Complaints by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a38" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#181c27', border: '1px solid #252a38', borderRadius: 12, color: '#f3f4f6' }} />
                <Bar dataKey="count" fill="#5c6ef3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-10">No data</p>}
        </div>
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="font-display font-semibold text-white">Recent Complaints</h2>
          <Link to="/admin/complaints" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-surface-border">
          {stats?.recentComplaints?.length === 0 && (
            <p className="text-gray-500 text-center py-10">No complaints yet</p>
          )}
          {stats?.recentComplaints?.map(c => (
            <Link key={c._id} to={`/admin/complaints/${c._id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover transition-colors group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={c.category} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <p className="font-medium text-white truncate group-hover:text-brand-300">{c.title}</p>
                  <p className="text-gray-500 text-xs">{c.studentId?.name} · Room {c.roomNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <StatusBadge status={c.status} />
                <ArrowRightIcon className="w-4 h-4 text-gray-600 group-hover:text-brand-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
