import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccount } from '../../../lib/api'; // Adjust the import based on your API utility

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  iban: z.string().optional(),
});

const CreateAccountPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createAccount(data);
      // Redirect or show success message
    } catch (error) {
      console.error('Error creating account:', error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Create New Account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Account Name</label>
          <input
            type="text"
            {...register('name')}
            className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Account Type</label>
          <select
            {...register('accountType')}
            className={`mt-1 block w-full border ${errors.accountType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          >
            <option value="">Select account type</option>
            <option value="asset">Asset</option>
            <option value="expense">Expense</option>
            <option value="revenue">Revenue</option>
            <option value="liability">Liability</option>
          </select>
          {errors.accountType && <p className="text-red-500 text-sm">{errors.accountType.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">IBAN (optional)</label>
          <input
            type="text"
            {...register('iban')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Account
        </button>
      </form>
    </div>
  );
};

export default CreateAccountPage;