import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMember?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireMember = false, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-red-200 dark:border-red-700">
          <CardHeader className="text-center bg-white dark:bg-gray-800 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Access Denied</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Admin privileges required to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center bg-white dark:bg-gray-800 px-6 py-4 rounded-b-lg">
            <Alert className="border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600 mb-4">
              <AlertDescription className="text-red-800 dark:text-red-300">
                Only administrators can access this page. Your current role is: <span className="font-semibold capitalize">{user?.role.replace('_', ' ')}</span>
              </AlertDescription>
            </Alert>
            <Button 
              onClick={logout} 
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireMember && user?.role === 'non_member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-orange-200 dark:border-orange-700">
          <CardHeader className="text-center bg-white dark:bg-gray-800 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">Membership Required</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              You need member status to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-white dark:bg-gray-800 px-6 py-4 rounded-b-lg">
            <Alert className="border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600">
              <AlertDescription className="text-orange-800 dark:text-orange-300">
                Your account is currently set as "Non-Member". Please contact an administrator to upgrade your account to "Member" status to access the crypto dashboard and analytics.
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Current role: <span className="font-semibold capitalize text-gray-900 dark:text-white">{user?.role.replace('_', ' ')}</span>
              </p>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;