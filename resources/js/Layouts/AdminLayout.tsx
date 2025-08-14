// resources/js/Layouts/AdminLayout.tsx
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';                             // подключает стили для библиотеки react-toastify (уведомления).
import { ToastContainer, Slide, Zoom, Flip, Bounce } from 'react-toastify'; // Для начала установил библиотеку react-toastify для создания Toast-уведомлений в React.: npm install react-toastify

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

      <ToastContainer 
          transition={Slide} // или Zoom, Flip, Bounce - это будет анимация по умолчанию
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />

    </>
  );
};