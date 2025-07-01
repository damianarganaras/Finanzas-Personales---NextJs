import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const accounts = await prisma.account.findMany();
    return res.status(200).json(accounts);
  }

  if (req.method === 'POST') {
    const { name, accountTypeId, virtualBalance, iban } = req.body;
    const newAccount = await prisma.account.create({
      data: {
        name,
        accountTypeId,
        virtualBalance,
        iban,
      },
    });
    return res.status(201).json(newAccount);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}