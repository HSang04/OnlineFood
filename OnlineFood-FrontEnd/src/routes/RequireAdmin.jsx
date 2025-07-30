
import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ children }) => {
//   const token = localStorage.getItem('jwt');
  const vaiTro = localStorage.getItem('vaiTro');

  if (vaiTro !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAdmin;
