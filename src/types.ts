export type UserRole = 'kid' | 'parent' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  familyId?: string;
  photoURL?: string;
  createdAt: number;
  points?: number; // For kids
}

export interface Family {
  id: string;
  name: string;
  parentIds: string[];
  kidIds: string[];
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  assignedTo: string; // kidId
  createdBy: string; // parentId
  familyId: string;
  status: 'pending' | 'completed' | 'approved';
  category?: string;
  dueDate?: number;
  createdAt: number;
  completedAt?: number;
  approvedAt?: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  familyId: string;
  createdAt: number;
}

export interface Redemption {
  id: string;
  rewardId: string;
  kidId: string;
  familyId: string;
  status: 'pending' | 'fulfilled';
  createdAt: number;
}
