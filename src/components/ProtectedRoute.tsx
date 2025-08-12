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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-blue-200 dark:border-blue-700">
          <CardHeader className="text-center bg-white dark:bg-gray-800 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">Welcome to the Waitlist!</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              You've successfully joined our exclusive waitlist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-white dark:bg-gray-800 px-6 py-4 rounded-b-lg">
            <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600">
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                Thank you for joining DeltaLens! You have been added to our waitlist and will be notified via email when it's time to become a member. We're working hard to bring you the best trading analytics experience.
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We'll keep you updated on your membership status and notify you as soon as access becomes available.
              </p>
              <Button 
                onClick={logout} 
                variant="outline"
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