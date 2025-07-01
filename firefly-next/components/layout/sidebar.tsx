import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 h-full bg-gray-800 text-white">
      <div className="p-4">
        <h2 className="text-lg font-bold">Firefly Next</h2>
      </div>
      <nav className="mt-4">
        <ul>
          <li>
            <Link href="/dashboard" className="block p-2 hover:bg-gray-700">Dashboard</Link>
          </li>
          <li>
            <Link href="/accounts" className="block p-2 hover:bg-gray-700">Cuentas</Link>
          </li>
          <li>
            <Link href="/transactions" className="block p-2 hover:bg-gray-700">Transacciones</Link>
          </li>
          <li>
            <Link href="/budgets" className="block p-2 hover:bg-gray-700">Presupuestos</Link>
          </li>
          <li>
            <Link href="/bills" className="block p-2 hover:bg-gray-700">Facturas</Link>
          </li>
          <li>
            <Link href="/piggy-banks" className="block p-2 hover:bg-gray-700">Metas de Ahorro</Link>
          </li>
          <li>
            <Link href="/reports" className="block p-2 hover:bg-gray-700">Reportes</Link>
          </li>
          <li>
            <Link href="/settings" className="block p-2 hover:bg-gray-700">Configuración</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;