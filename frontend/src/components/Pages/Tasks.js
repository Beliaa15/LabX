import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Common/Sidebar';
import Header from '../Common/Header';
import { Card } from '../ui/card';
import { getCourseTasksById } from '../../services/taskService';
import { getUserCourses } from '../../services/courseService';
import { Calendar, Clock, BookOpen, PlayCircle, FileText } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const Tasks = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useUI();
  const { isStudent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getUserCourses();
        
        // Fetch tasks for each course
        const coursesWithTasks = await Promise.all(
          coursesData.map(async (course) => {
            const tasksData = await getCourseTasksById(course._id);
            return {
              ...course,
              tasks: tasksData.tasks || []
            };
          })
        );

        // Filter out courses with no tasks
        const filteredCourses = coursesWithTasks.filter(course => course.tasks.length > 0);
        setCourses(filteredCourses);
      } catch (error) {
        console.error('Error fetching courses and tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);  const handleOpenTask = (courseId, task) => {
    const basePath = isStudent ? '/my-courses' : '/courses';
    navigate(`${basePath}/${courseId}/task/${task._id}`, {
      state: { task },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isTaskExpired = (dueDate) => {
    if (!dueDate) return false;
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    return now > taskDueDate;
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    const diffDays = Math.ceil((taskDueDate - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  const getTaskStats = () => {
    const totalTasks = courses.reduce((total, course) => total + course.tasks.length, 0);
    const expiredTasks = courses.reduce((total, course) => {
      return total + course.tasks.filter(task => {
        const courseTaskData = task.courseTasks.find(ct => ct.course === course._id);
        return isTaskExpired(courseTaskData?.dueDate);
      }).length;
    }, 0);
    const dueSoonTasks = courses.reduce((total, course) => {
      return total + course.tasks.filter(task => {
        const courseTaskData = task.courseTasks.find(ct => ct.course === course._id);
        return isDueSoon(courseTaskData?.dueDate) && !isTaskExpired(courseTaskData?.dueDate);
      }).length;
    }, 0);

    return { totalTasks, expiredTasks, dueSoonTasks };
  };

  const getPageTitle = () => {
    if (loading) return 'Loading Tasks - LabX';
    const { totalTasks } = getTaskStats();
    return `Tasks (${totalTasks}) - LabX`;
  };

  const getPageDescription = () => {
    if (loading) return 'Loading your assigned tasks on LabX virtual laboratory platform.';
    const { totalTasks, expiredTasks, dueSoonTasks } = getTaskStats();
    
    if (totalTasks === 0) {
      return 'No tasks currently assigned. Check back later for new virtual laboratory assignments on LabX.';
    }
    
    let description = `View and complete your ${totalTasks} assigned virtual laboratory tasks on LabX platform.`;
    if (dueSoonTasks > 0) {
      description += ` ${dueSoonTasks} task${dueSoonTasks > 1 ? 's' : ''} due soon.`;
    }
    if (expiredTasks > 0) {
      description += ` ${expiredTasks} task${expiredTasks > 1 ? 's' : ''} expired.`;
    }
    
    return description;
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="keywords" content="student tasks, virtual laboratory assignments, due dates, interactive tasks, LabX" />
      </Helmet>
      <div className="min-h-screen surface-base">
        <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
        <div
          className={`${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-300 ease-in-out`}
        >
          <Header title="Tasks" />

          <main className="flex-1 relative overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <LoadingSpinner size="lg" className="text-indigo-500" />
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <FileText className="w-12 h-12 text-muted mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">No tasks available</h3>
                  <p className="text-secondary text-center">
                    There are no tasks assigned to your courses
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {courses.map((course) => (
                    <Card key={course._id}>
                      <div className="px-6 py-4 border-b border-primary">
                        <h3 className="text-lg font-medium text-primary flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                          {course.name}
                        </h3>
                      </div>
                      <div className="divide-y divide-primary">
                        {course.tasks.map((task) => {
                          const courseTaskData = task.courseTasks.find(
                            (ct) => ct.course === course._id
                          );
                          const expired = isTaskExpired(courseTaskData?.dueDate);
                          const dueSoon = isDueSoon(courseTaskData?.dueDate);

                          return (
                            <div
                              key={task._id}
                              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                expired
                                  ? 'bg-red-50/50 dark:bg-red-900/20'
                                  : dueSoon
                                  ? 'bg-yellow-50/50 dark:bg-yellow-900/20'
                                  : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-medium text-primary truncate">
                                    {task.title}
                                  </h4>
                                  <p className="mt-1 text-sm text-secondary line-clamp-2">
                                    {task.description}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-3">
                                    <div className="inline-flex items-center text-xs text-secondary">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Due: {formatDate(courseTaskData?.dueDate)}
                                    </div>
                                    {(expired || dueSoon) && (
                                      <div
                                        className={`inline-flex items-center text-xs ${
                                          expired
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-yellow-600 dark:text-yellow-400'
                                        }`}
                                      >
                                        <Clock className="w-4 h-4 mr-1" />
                                        {expired ? 'Expired' : 'Due Soon'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleOpenTask(course._id, task)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    task.webglData && task.webglData.buildFolderPath && !expired
                                      ? 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  }`}
                                  disabled={
                                    !task.webglData ||
                                    !task.webglData.buildFolderPath ||
                                    expired
                                  }
                                  title={
                                    expired
                                      ? 'Task has expired'
                                      : task.webglData && task.webglData.buildFolderPath
                                      ? 'Open Task'
                                      : 'Task files not uploaded'
                                  }
                                >
                                  <PlayCircle className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Tasks;
