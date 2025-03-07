import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, AlertCircle, CheckCircle, Eye, Edit } from 'lucide-react';
import { APPLICATION_STATUS } from '../../utils/constants';

const statusIcons = {
  [APPLICATION_STATUS.PENDING]: <Clock className="text-yellow-500" size={20} />,
  [APPLICATION_STATUS.SUBMITTED]: <AlertCircle className="text-blue-500" size={20} />,
  [APPLICATION_STATUS.ACCEPTED]: <CheckCircle className="text-green-500" size={20} />,
  [APPLICATION_STATUS.REJECTED]: <AlertCircle className="text-red-500" size={20} />
};

export const ApplicationCard = ({ 
  application, 
  viewMode = 'student',
  universityName,
  onView, 
  onEdit 
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        Application #{application.application_id}
        {statusIcons[application.status]}
      </CardTitle>
      <p className="text-sm text-gray-500">
        {viewMode === 'student' ? universityName : `Student ID: ${application.user_id}`}
      </p>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <p>Status: {application.status}</p>
        {application.submission_date && (
          <p>Submitted: {application.submission_date}</p>
        )}
      </div>
      <div className="flex gap-2">
        {application.status === APPLICATION_STATUS.PENDING ? (
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={() => onEdit(application.application_id)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onView(application.application_id)}
          >
            <Eye className="mr-2 h-4 w-4" /> 
            {viewMode === 'university' ? 'Review' : 'View'}
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);
