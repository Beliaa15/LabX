// src/components/Auth/GoogleLogin.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { handleGoogleLogin } from './helperFunctions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';

const GoogleLogin = () => {
  
  const navigate = useNavigate();
  const { saveToken } = useAuth(); 
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Student Portal</CardTitle>
          <CardDescription>Sign in with your Google account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGoogleLogin(saveToken, navigate)}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleLogin;