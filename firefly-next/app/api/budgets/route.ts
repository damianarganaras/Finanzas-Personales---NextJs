import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const budgets = await prisma.budget.findMany();
    return res.status(200).json(budgets);
  }

  if (req.method === 'POST') {
    const { name, userId } = req.body;
    const newBudget = await prisma.budget.create({
      data: {
        name,
        userId,
      },
    });
    return res.status(201).json(newBudget);
  }

  if (req.method === 'PUT') {
    const { id, name } = req.body;
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: { name },
    });
    return res.status(200).json(updatedBudget);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await prisma.budget.delete({
      where: { id },
    });
    return res.status(204).end();
  }

  return res.status(405).json({ message: 'Method not allowed' });
}