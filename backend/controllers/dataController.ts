import { Request, Response } from 'express';
import { User, Task, Family } from '../models';
import { AuthRequest } from '../middleware/auth';

// User Profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const getKids = async (req: AuthRequest, res: Response) => {
  try {
    const kids = await User.find({ familyId: req.user?.familyId, role: 'kid' });
    res.json(kids);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch kids' });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { firebaseUid, email, displayName, role, familyName } = req.body;
  try {
    let user = await User.findOne({ firebaseUid });
    if (user) return res.status(400).json({ error: 'User already registered' });

    let familyId = 'default-family';
    if (role === 'parent' && familyName) {
      const family = await Family.create({
        name: familyName,
        adminId: firebaseUid
      });
      familyId = (family._id as string);
    }

    user = await User.create({
      firebaseUid,
      email,
      displayName,
      role,
      familyId
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Tasks
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ familyId: req.user?.familyId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user?.uid,
      familyId: req.user?.familyId,
      status: 'pending'
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, familyId: req.user?.familyId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const approveTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const task = await Task.findOne({ _id: id, familyId: req.user?.familyId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = 'approved';
    task.approvedAt = new Date();
    await task.save();

    // Reward points to the kid
    await User.findOneAndUpdate(
      { firebaseUid: task.assignedTo },
      { $inc: { points: task.points } }
    );

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Approval failed' });
  }
};
