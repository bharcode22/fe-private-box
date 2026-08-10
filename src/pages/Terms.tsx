import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TermsModal } from '../components/dashboard/TermsModal';

export const Terms: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleCancel = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Render Blocking Terms Modal directly */}
      <TermsModal
        isOpen={true}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Terms;
