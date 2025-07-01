import React from 'react';

const Header = () => {
    return (
        <header className="bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">Firefly Next</h1>
            <nav>
                <ul className="flex space-x-4">
                    <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
                    <li><a href="/accounts" className="hover:underline">Cuentas</a></li>
                    <li><a href="/transactions" className="hover:underline">Transacciones</a></li>
                    <li><a href="/budgets" className="hover:underline">Presupuestos</a></li>
                    <li><a href="/bills" className="hover:underline">Facturas</a></li>
                    <li><a href="/piggy-banks" className="hover:underline">Metas de Ahorro</a></li>
                    <li><a href="/reports" className="hover:underline">Reportes</a></li>
                    <li><a href="/settings" className="hover:underline">Configuración</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;