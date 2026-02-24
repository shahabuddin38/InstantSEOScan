import { Request, Response } from 'express';
import {
  queryUsers,
  updateUser,
  deleteUser,
  queryPlans,
  querySubscriptions,
  addSubscription,
  updateSubscription
} from '../lib/db.js';

export async function getPendingUsersHandler(req: Request, res: Response) {
  try {
    const users = queryUsers();
    const pendingUsers = users
      .filter(u => u.approved === 0)
      .map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        created_at: u.created_at
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
}

export async function approveUserHandler(req: Request, res: Response) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    updateUser(userId, { approved: 1 });
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
}

export async function rejectUserHandler(req: Request, res: Response) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    deleteUser(userId);
    res.json({ message: 'User rejected and removed' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
}

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = queryUsers();
    const subscriptions = querySubscriptions();

    const usersWithPlans = users.map(u => {
      const userSubs = subscriptions.filter(s => s.user_id === u.id && s.status === 'active');
      const activeSub = userSubs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        approved: u.approved,
        created_at: u.created_at,
        plan: activeSub ? activeSub.plan_id : null,
        end_date: activeSub ? activeSub.end_date : null
      };
    });

    res.json(usersWithPlans);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateSubscriptionHandler(req: Request, res: Response) {
  const { userId, planId, daysValid } = req.body;

  if (!userId || !planId || !daysValid) {
    return res.status(400).json({ error: 'User ID, plan ID, and days valid are required' });
  }

  try {
    // End previous subscription
    const subs = querySubscriptions({ user_id: userId });
    subs.forEach(sub => {
      if (sub.status === 'active') {
        updateSubscription(sub.id, { status: 'cancelled' });
      }
    });

    // Create new subscription
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(daysValid));

    addSubscription({
      user_id: userId,
      plan_id: planId,
      start_date: startDate,
      end_date: endDate.toISOString(),
      status: 'active',
      auto_renew: 1
    });

    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
}

export async function getPricingPlansHandler(req: Request, res: Response) {
  try {
    const plans = queryPlans();
    
    const plansWithFeatures = plans
      .map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
      }))
      .sort((a, b) => a.price - b.price);

    res.json(plansWithFeatures);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
}

export async function getSubscriptionStatsHandler(req: Request, res: Response) {
  try {
    const users = queryUsers();
    const subscriptions = querySubscriptions();
    const plans = queryPlans();

    const totalUsers = users.length;
    const approvedUsers = users.filter(u => u.approved === 1).length;
    const pendingUsers = users.filter(u => u.approved === 0).length;

    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const planStats = plans.map(plan => {
      const planSubs = activeSubs.filter(s => s.plan_id === plan.id);
      return {
        name: plan.name,
        count: planSubs.length,
        monthly_revenue: planSubs.length * plan.price
      };
    });

    res.json({
      totalUsers,
      approvedUsers,
      pendingUsers,
      planStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
