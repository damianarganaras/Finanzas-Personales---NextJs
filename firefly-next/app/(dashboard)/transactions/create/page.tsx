import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransaction } from '../../../lib/api'; // Adjust the import path as necessary

const transactionSchema = z.object({
  accountId: z.string().nonempty('Account is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  description: z.string().optional(),
  type: z.enum(['withdrawal', 'deposit', 'transfer']),
});

const CreateTransactionPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createTransaction(data);
      // Handle successful transaction creation (e.g., redirect or show a success message)
    } catch (error) {
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Create Transaction</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div>
          <label htmlFor="accountId" className="block">Account</label>
          <select id="accountId" {...register('accountId')} className="border rounded p-2">
            {/* Populate options with accounts */}
          </select>
          {errors.accountId && <span className="text-red-500">{errors.accountId.message}</span>}
        </div>
        <div>
          <label htmlFor="amount" className="block">Amount</label>
          <input type="number" id="amount" {...register('amount')} className="border rounded p-2" />
          {errors.amount && <span className="text-red-500">{errors.amount.message}</span>}
        </div>
        <div>
          <label htmlFor="description" className="block">Description</label>
          <input type="text" id="description" {...register('description')} className="border rounded p-2" />
        </div>
        <div>
          <label htmlFor="type" className="block">Type</label>
          <select id="type" {...register('type')} className="border rounded p-2">
            <option value="withdrawal">Withdrawal</option>
            <option value="deposit">Deposit</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white rounded p-2">Create Transaction</button>
      </form>
    </div>
  );
};

export default CreateTransactionPage;