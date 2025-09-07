import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../context/StateContext';
import MediatorDisputeCenter from '../../components/MediatorDisputeCenter';

const DisputeCenter = () => {
  const router = useRouter();
  const [{ userInfo }] = useStateProvider();

  useEffect(() => {
    if (!userInfo) {
      router.push('/auth');
      return;
    }
  }, [userInfo, router]);

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <MediatorDisputeCenter />
      </div>
    </div>
  );
};

export default DisputeCenter;