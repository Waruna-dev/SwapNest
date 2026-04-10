import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-200 text-yellow-800',  
    accepted: 'bg-green-100 text-green-800',  
    rejected: 'bg-red-100 text-red-800',      
    completed: 'bg-blue-100 text-blue-800',   
    cancelled: 'bg-gray-100 text-gray-800'    
  };

  const icons = {
    pending: '',
    accepted: '',
    rejected: '',
    completed: '',
    cancelled: ''
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {icons[status]} {status}
    </span>
  );
};

export default StatusBadge;