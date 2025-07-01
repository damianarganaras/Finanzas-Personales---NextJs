import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db'; // Adjust the import path as necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const transactions = await prisma.transaction.findMany();
    return res.status(200).json(transactions);
  }

  if (req.method === 'POST') {
    const { accountId, amount, description } = req.body;
    const newTransaction = await prisma.transaction.create({
      data: {
        accountId,
        amount,
        description,
      },
    });
    return res.status(201).json(newTransaction);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}