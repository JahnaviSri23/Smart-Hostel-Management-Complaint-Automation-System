const Maintenance = require('../models/Maintenance');
const Complaint = require('../models/Complaint');

const getMyTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { staffId: req.user._id };
    if (status) query.status = status;

    const tasks = await Maintenance.find(query)
      .populate({ path: 'complaintId', populate: { path: 'studentId', select: 'name email' } })
      .populate('staffId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) { next(error); }
};

const updateTask = async (req, res, next) => {
  try {
    const { status, note, estimatedCompletion } = req.body;

    const task = await Maintenance.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (task.staffId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (status) task.status = status;
    if (estimatedCompletion) task.estimatedCompletion = estimatedCompletion;
    if (status === 'completed') task.completedAt = new Date();

    if (note) {
      task.notes.push({ text: note, addedBy: req.user._id });
      // Update complaint status too
      const newStatus = status === 'completed' ? 'resolved' : 'in_progress';
      await Complaint.findByIdAndUpdate(task.complaintId, { status: newStatus });
    }

    await task.save();
    const updated = await Maintenance.findById(task._id)
      .populate({ path: 'complaintId', populate: { path: 'studentId', select: 'name email' } })
      .populate('staffId', 'name email');

    res.json({ success: true, message: 'Task updated.', data: updated });
  } catch (error) { next(error); }
};

module.exports = { getMyTasks, updateTask };
