import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/dbConnect';
import { Todo } from '@/models/ToDo';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: todos });
  } catch (error) {
    res.status(400).json({ success: false });
  }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    const todo = await Todo.create(req.body);
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    res.status(400).json({ success: false });
  }
}
