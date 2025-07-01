import React from 'react';
import Sidebar from '../layout/sidebar';
import Header from '../layout/header';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;