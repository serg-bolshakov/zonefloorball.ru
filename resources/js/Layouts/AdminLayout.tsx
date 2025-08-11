// resources/js/Layouts/AdminLayout.tsx
import React from 'react';
import Sidebar from '@/Components/Admin/Layout/Sidebar';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </>
  );
};