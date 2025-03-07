import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useRoleStore } from '../../context/roleStore';

export const Navigation = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const { clearRole } = useRoleStore();
  const role = useRoleStore(state => state.role);

  const onLogout = () => {
    handleLogout();
    clearRole();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">
              {role === 'uni_admin' ? 'University Portal' : 'Student Portal'}
            </h1>
            <div className="hidden md:flex space-x-8">
              <Link 
                to="/my_dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              {role === 'uni_admin' && (
                <Link 
                  to="/customizing_fields" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Application Fields
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};