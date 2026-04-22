import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI, studentAPI, maintenanceAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge, LoadingState, Modal } from '../../components/UI';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon, UserIcon, CalendarIcon, HomeIcon,
  ClockIcon, CheckCircleIcon, WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [assignData, setAssignData] = useState({ assignedTo: '', adminNotes: '', priority: '' });
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadComplaint(); }, [id]);

  const loadComplaint = async () => {
    setLoading(true);
    try {
      const { data } = await complaintAPI.getOne(id);
      setComplaint(data.data);
      setMaintenance(data.data.maintenance);
    } catch { toast.error('Failed to load complaint'); }
    setLoading(false);
  };

  const loadStaff = async () => {
    try {
      const { data } = await studentAPI.getMaintenanceStaff();
      setStaffList(data.data);
    } catch {}
  };

  const handleOpenAssign = async () => {
    await loadStaff();
    setAssignData({
      assignedTo: complaint.assignedTo?._id || '',
      adminNotes: complaint.adminNotes || '',
      priority: complaint.priority
    });
    setAssignModal(true);
  };

  const handleAssign = async () => {
    setUpdating(true);
    try {
      await complaintAPI.update(id, assignData);
      toast.success('Complaint updated successfully');
      setAssignModal(false);
      loadComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setUpdating(false);
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      await complaintAPI.update(id, { status });
      toast.success(`Status updated to ${status}`);
      loadComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setUpdating(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setUpdating(true);
    try {
      await maintenanceAPI.updateTask(maintenance._id, { note: noteText, status: maintenance.status });
      toast.success('Note added');
      setNoteText('');
      loadComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    }
    setUpdating(false);
  };

  const handleMarkComplete = async () => {
    setUpdating(true);
    try {
      await maintenanceAPI.updateTask(maintenance._id, { status: 'completed', note: 'Task completed' });
      toast.success('Marked as completed!');
      loadComplaint();
    } catch (err) {
      toast.error('Failed to update');
    }
    setUpdating(false);
  };

  const goBack = () => {
    if (user.role === 'admin') navigate('/admin/complaints');
    else if (user.role === 'maintenance') navigate('/maintenance');
    else navigate('/student/complaints');
  };

  if (loading) return <LoadingState message="Loading complaint details..." />;
  if (!complaint) return <div className="text-center text-gray-400 py-20">Complaint not found</div>;

  const timeline = [
    { label: 'Submitted', date: complaint.createdAt, done: true, icon: '📋' },
    { label: 'Assigned', date: maintenance?.createdAt, done: !!maintenance, icon: '👷' },
    { label: 'In Progress', date: null, done: ['in_progress', 'resolved', 'closed'].includes(complaint.status), icon: '🔧' },
    { label: 'Resolved', date: complaint.resolvedAt, done: ['resolved', 'closed'].includes(complaint.status), icon: '✅' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={goBack} className="p-2 text-gray-400 hover:text-white hover:bg-surface-hover rounded-xl transition-colors mt-0.5">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryBadge category={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">{complaint.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white mb-3">Description</h2>
            <p className="text-gray-300 leading-relaxed">{complaint.description}</p>
            {complaint.adminNotes && (
              <div className="mt-4 p-3 bg-brand-900/20 border border-brand-600/30 rounded-xl">
                <p className="text-xs text-brand-400 font-medium mb-1">Admin Notes</p>
                <p className="text-gray-300 text-sm">{complaint.adminNotes}</p>
              </div>
            )}
          </div>

          {/* Maintenance notes */}
          {maintenance?.notes?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-white mb-4">Progress Notes</h2>
              <div className="space-y-3">
                {maintenance.notes.map((note, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center text-xs text-gray-400 flex-shrink-0 mt-0.5">
                      {note.addedBy?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 bg-surface p-3 rounded-xl border border-surface-border">
                      <p className="text-gray-300 text-sm">{note.text}</p>
                      <p className="text-gray-600 text-xs mt-1">{new Date(note.addedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add note (maintenance staff) */}
          {user.role === 'maintenance' && maintenance && complaint.status !== 'resolved' && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-white mb-4">Add Progress Note</h2>
              <textarea className="input resize-none min-h-24" placeholder="Describe what work was done..."
                value={noteText} onChange={e => setNoteText(e.target.value)} />
              <div className="flex gap-3 mt-3">
                <button onClick={handleAddNote} disabled={updating || !noteText.trim()} className="btn-primary">
                  {updating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Add Note
                </button>
                <button onClick={handleMarkComplete} disabled={updating} className="btn-secondary">
                  <CheckCircleIcon className="w-4 h-4" /> Mark Complete
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white mb-4">Timeline</h2>
            <div className="space-y-0">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border
                      ${t.done ? 'bg-brand-600 border-brand-600' : 'bg-surface border-surface-border'}`}>
                      {t.done ? t.icon : <span className="text-gray-600">{i + 1}</span>}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 h-8 ${t.done ? 'bg-brand-600/40' : 'bg-surface-border'}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium text-sm ${t.done ? 'text-white' : 'text-gray-500'}`}>{t.label}</p>
                    {t.date && <p className="text-xs text-gray-500 mt-0.5">{new Date(t.date).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-display font-semibold text-white">Details</h2>
            {[
              { icon: HomeIcon, label: 'Room', value: complaint.roomNumber },
              { icon: CalendarIcon, label: 'Submitted', value: new Date(complaint.createdAt).toLocaleDateString() },
              { icon: UserIcon, label: 'Student', value: complaint.studentId?.name || 'N/A' },
              { icon: WrenchScrewdriverIcon, label: 'Assigned To', value: complaint.assignedTo?.name || 'Unassigned' },
              { icon: ClockIcon, label: 'Last Updated', value: new Date(complaint.updatedAt).toLocaleDateString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-hover rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm text-gray-200">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Admin actions */}
          {user.role === 'admin' && (
            <div className="card p-5 space-y-3">
              <h2 className="font-display font-semibold text-white">Admin Actions</h2>
              <button onClick={handleOpenAssign} className="btn-primary w-full">
                <WrenchScrewdriverIcon className="w-4 h-4" />
                {complaint.assignedTo ? 'Reassign / Edit' : 'Assign to Staff'}
              </button>
              {complaint.status !== 'resolved' && (
                <button onClick={() => handleStatusUpdate('resolved')} disabled={updating}
                  className="btn-secondary w-full text-green-400">
                  <CheckCircleIcon className="w-4 h-4" /> Mark Resolved
                </button>
              )}
              {complaint.status !== 'rejected' && complaint.status !== 'resolved' && (
                <button onClick={() => handleStatusUpdate('rejected')} disabled={updating}
                  className="btn-danger w-full">Reject Complaint</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Complaint" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Assign to Staff</label>
            <select className="input" value={assignData.assignedTo}
              onChange={e => setAssignData({ ...assignData, assignedTo: e.target.value })}>
              <option value="">-- Unassigned --</option>
              {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={assignData.priority}
              onChange={e => setAssignData({ ...assignData, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="label">Admin Notes (optional)</label>
            <textarea className="input resize-none min-h-20" placeholder="Add notes for the maintenance staff..."
              value={assignData.adminNotes}
              onChange={e => setAssignData({ ...assignData, adminNotes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAssignModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAssign} disabled={updating} className="btn-primary flex-1">
              {updating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
