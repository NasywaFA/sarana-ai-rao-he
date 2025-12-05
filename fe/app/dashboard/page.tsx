"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { logout } from '../../services/loginService';
import { getUserInfo, getAuthToken, isAuthenticated } from '../../helpers/auth';
import { UserType } from '@/types/UserType';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<{
    isAuth: boolean;
    tokenPreview: string;
  }>({ isAuth: false, tokenPreview: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, token, isAuth] = await Promise.all([
          getUserInfo(),
          getAuthToken(),
          isAuthenticated()
        ]);

        setUser(userData);
        setAuthStatus({
          isAuth,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sarana-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your customer support overview for today.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Category</p>
              <p className="font-medium text-gray-900">{user?.business_category}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}