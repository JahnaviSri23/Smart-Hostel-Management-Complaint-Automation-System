const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');
const Student = require('../models/Student');

// @desc    Submit complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, priority, roomNumber } = req.body;

    // Get student room if not provided
    let room = roomNumber;
    if (!room && req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) room = student.roomNumber;
    }

    const complaint = await Complaint.create({
      studentId: req.user._id,
      roomNumber: room,
      title,
      description,
      category,
      priority: priority || 'medium'
    });

    // Notify all admins
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map(admin =>
      Notification.create({
        userId: admin._id,
        title: 'New Complaint Submitted',
        message: `${req.user.name} submitted a ${category} complaint: "${title}"`,
        type: 'complaint_submitted',
        relatedId: complaint._id
      })
    ));

    res.status(201).json({ success: true, message: 'Complaint submitted successfully.', data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'maintenance') {
      query.assignedTo = req.user._id;
    }

    // Filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Authorization check
    if (req.user.role === 'student' && complaint.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Get maintenance record if exists
    const maintenance = await Maintenance.findOne({ complaintId: complaint._id })
      .populate('staffId', 'name email')
      .populate('notes.addedBy', 'name');

    res.json({ success: true, data: { ...complaint.toObject(), maintenance } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status / assign
// @route   PUT /api/complaints/:id
// @access  Private (Admin/Maintenance)
const updateComplaint = async (req, res, next) => {
  try {
    const { status, assignedTo, adminNotes, priority } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Maintenance staff can only update status
    if (req.user.role === 'maintenance') {
      if (complaint.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      if (status) complaint.status = status;
    } else if (req.user.role === 'admin') {
      if (status) complaint.status = status;
      if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
      if (adminNotes) complaint.adminNotes = adminNotes;
      if (priority) complaint.priority = priority;

      // Create/update maintenance record if assigning
      if (assignedTo) {
        const existing = await Maintenance.findOne({ complaintId: complaint._id });
        if (!existing) {
          await Maintenance.create({
            complaintId: complaint._id,
            staffId: assignedTo,
            assignedBy: req.user._id
          });
        } else {
          existing.staffId = assignedTo;
          existing.status = 'assigned';
          await existing.save();
        }

        // Notify maintenance staff
        await Notification.create({
          userId: assignedTo,
          title: 'New Complaint Assigned',
          message: `You have been assigned a ${complaint.category} complaint: "${complaint.title}"`,
          type: 'complaint_assigned',
          relatedId: complaint._id
        });

        complaint.status = 'in_progress';
      }
    }

    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      // Update maintenance record
      await Maintenance.findOneAndUpdate(
        { complaintId: complaint._id },
        { status: 'completed', completedAt: new Date() }
      );

      // Notify student
      await Notification.create({
        userId: complaint.studentId,
        title: 'Complaint Resolved',
        message: `Your ${complaint.category} complaint "${complaint.title}" has been resolved.`,
        type: 'complaint_resolved',
        relatedId: complaint._id
      });
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email')
      .populate('assignedTo', 'name email');

    res.json({ success: true, message: 'Complaint updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin or own student)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await Maintenance.deleteOne({ complaintId: complaint._id });
    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Complaint deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint stats (admin)
// @route   GET /api/complaints/stats
// @access  Private (Admin)
const getStats = async (req, res, next) => {
  try {
    const [statusStats, categoryStats, priorityStats, recentComplaints] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Complaint.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'name')
    ]);

    const total = await Complaint.countDocuments();

    res.json({
      success: true,
      data: { total, statusStats, categoryStats, priorityStats, recentComplaints }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createComplaint, getComplaints, getComplaint, updateComplaint, deleteComplaint, getStats };
