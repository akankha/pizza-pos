'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TouchButton from '@/components/TouchButton';
import { Users, Package, Settings, BarChart, LogOut } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/admin/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {user.full_name || user.username}</p>
            <p className="text-sm text-gray-500">Role: {user.role}</p>
          </div>
          <div className="flex gap-3">
            <TouchButton onClick={() => router.push('/')} variant="secondary">
              Back to POS
            </TouchButton>
            <TouchButton onClick={handleLogout} variant="danger">
              <LogOut className="inline mr-2" size={20} />
              Logout
            </TouchButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <TouchButton
            onClick={() => alert('Users management - Coming soon!')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700"
          >
            <Users size={64} />
            <span className="text-2xl">Manage Users</span>
          </TouchButton>

          <TouchButton
            onClick={() => alert('Menu management - Coming soon!')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-green-600 hover:bg-green-700"
          >
            <Package size={64} />
            <span className="text-2xl">Manage Menu</span>
          </TouchButton>

          <TouchButton
            onClick={() => alert('Reports - Coming soon!')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-purple-600 hover:bg-purple-700"
          >
            <BarChart size={64} />
            <span className="text-2xl">View Reports</span>
          </TouchButton>

          <TouchButton
            onClick={() => alert('Settings - Coming soon!')}
            variant="primary"
            size="lg"
            className="h-48 flex flex-col items-center justify-center gap-4 bg-gray-600 hover:bg-gray-700"
          >
            <Settings size={64} />
            <span className="text-2xl">Settings</span>
          </TouchButton>
        </div>
      </div>
    </div>
  );
}
