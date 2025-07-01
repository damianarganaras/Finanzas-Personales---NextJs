import React from 'react';
import BudgetForm from '../../../components/forms/budget-form';
import { useBudgets } from '../../../hooks/use-budgets';

const BudgetsPage = () => {
  const { budgets, createBudget } = useBudgets();

  const handleCreateBudget = async (budgetData) => {
    await createBudget(budgetData);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Budgets</h1>
      <BudgetForm onSubmit={handleCreateBudget} />
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Existing Budgets</h2>
        <ul>
          {budgets.map((budget) => (
            <li key={budget.id} className="border-b py-2">
              {budget.name} - ${budget.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BudgetsPage;