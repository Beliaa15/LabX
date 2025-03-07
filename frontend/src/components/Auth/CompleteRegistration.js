import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormField,
} from '../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Navigation } from '../Common/Navigation';

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [role, setRole] = useState('student');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    
    try {
      await axios.post(
        'http://127.0.0.1:5000/auth/complete_registration',
        { national_id: nationalId, dob, gender, role },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      toast({
        title: "Registration completed",
        description: "Your profile has been updated successfully.",
      });
      
      navigate('/profile');
    } catch (error) {
      console.log(error)
      console.log(token)
      toast({
        title: "Error",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please provide additional information to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <FormField
                  name="national_id"
                  label="National ID"
                  control={
                    <Input
                      required
                      placeholder="Enter your national ID"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                    />
                  }
                />
                
                <FormField
                  name="dob"
                  label="Date of Birth"
                  control={
                    <Input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  }
                />
                
                <FormField
                  name="gender"
                  label="Gender"
                  control={
                <Select
                  value={gender}
                  onChange={(value) => setGender(value)} // Simplified and corrected handler
                  placeholder="Select gender"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                />
                  }
                />
                
                <FormField
                  name="role"
                  label="Role"
                  control={
                  <Select
                    value={role}
                    onChange={(value) => setRole(value)} // Corrected onChange handler
                    placeholder="Select role"
                    options={[
                      { value: "student", label: "Student" },
                      { value: "uni_admin", label: "University Admin" },
                    ]}
                  />

                  }
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing Registration
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteRegistration;
