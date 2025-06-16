import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, FileText, Users, Folder, Star } from 'lucide-react';
import { getUserCourses } from '../../services/courseService';
import { getCourseTasksById } from '../../services/taskService';
import { getFolders } from '../../services/folderService';

const StudentDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);    const [stats, setStats] = useState({
        totalCourses: 0,
        totalTasks: 0,
        totalFolders: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Fetch courses
                const coursesData = await getUserCourses();
                setCourses(coursesData);

                // Calculate statistics and fetch tasks
                let totalTasks = 0;
                let totalFolders = 0;
                let upcomingDeadlines = 0;
                const allTasks = [];

                // Fetch tasks and folders for each course
                for (const course of coursesData) {
                    // Fetch tasks
                    const tasksResponse = await getCourseTasksById(course._id);
                    const courseTasks = tasksResponse.tasks || [];
                    totalTasks += courseTasks.length;                    courseTasks.forEach(task => {
                        const courseTaskData = task.courseTasks.find(ct => ct.course === course._id);
                        if (courseTaskData) {
                            allTasks.push({
                                ...task,
                                courseName: course.name,
                                courseId: course._id,
                                dueDate: courseTaskData.dueDate
                            });
                        }
                    });

                    // Fetch folders
                    const foldersResponse = await getFolders(course._id);
                    totalFolders += foldersResponse.folders?.length || 0;
                }                // Filter tasks to show only those due within next 2 days and sort them
                const tasksWithinTwoDays = allTasks.filter(task => {
                    const dueDate = new Date(task.dueDate);
                    const now = new Date();
                    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 2; // Only show tasks due within next 2 days
                });
                tasksWithinTwoDays.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                setRecentTasks(tasksWithinTwoDays); // Show all urgent tasks

                setStats({                    totalCourses: coursesData.length,
                    totalTasks,
                    totalFolders
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
                <h2 className="text-2xl font-bold text-primary">Welcome back!</h2>                <p className="mt-2 text-secondary">
                    {loading
                        ? 'Loading your overview...'
                        : `You're enrolled in ${stats.totalCourses} courses`}
                </p>
            </div>

            {/* Quick Stats */}            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-bold text-muted truncate">
                                        Enrolled Courses
                                    </dt>
                                    <dd className="text-lg font-medium text-primary">
                                        {loading ? '...' : stats.totalCourses}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-bold text-muted truncate">
                                        Active Tasks
                                    </dt>
                                    <dd className="text-lg font-medium text-primary">
                                        {loading ? '...' : stats.totalTasks}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>                <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-bold text-muted truncate">
                                        Course Materials
                                    </dt>
                                    <dd className="text-lg font-medium text-primary">
                                        {loading ? '...' : stats.totalFolders}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course List */}
                <div className="surface-primary shadow-sm rounded-xl border border-primary">
                    <div className="px-6 py-4 flex justify-between items-center border-b border-primary">
                        <h3 className="text-lg leading-6 font-semibold text-primary flex items-center">
                            <BookOpen className="w-5 h-5 mr-2" />                            Recent Courses
                        </h3>
                        <span className="text-sm text-secondary">
                            {loading ? 'Loading...' : `Showing ${Math.min(4, courses.length)} of ${courses.length} courses`}
                        </span>
                    </div>
                    <div className="divide-y divide-primary">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <BookOpen className="w-12 h-12 text-muted mb-4" />
                                <h3 className="text-lg font-medium text-primary mb-2">No courses yet</h3>
                                <p className="text-secondary text-center">
                                    Enroll in a course to get started
                                </p>
                            </div>
                        ) : (                            <div className="divide-y divide-primary">
                {courses
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
                    .slice(0, 4) // Take only the 4 most recent courses
                    .map((course) => (                                    <div
                                        key={course._id}
                                        className="p-6 hover:bg-secondary/5 transition-colors group"
                                    >
                                        <div className="flex justify-between items-center gap-4">
                                            {/* Course Info - Left Side */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-primary font-medium text-lg truncate">{course.name}</h4>
                                                        {course.teacher && (
                                                            <p className="text-sm text-secondary truncate">
                                                                Prof. {course.teacher.firstName} {course.teacher.lastName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {course.description && (
                                                    <p className="text-sm text-secondary line-clamp-2 ml-13">
                                                        {course.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Stats - Right Side */}
                                            <div className="flex-shrink-0 flex items-center gap-6">
                                                <div className="text-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                                        {course.tasks?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                                                        Tasks
                                                    </div>
                                                </div>

                                                <div className="text-center px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Folder className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                                                        {course.folders?.length || 0}
                                                    </div>
                                                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wide">
                                                        Folders
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>                {/* Recent Tasks */}
                <div className="surface-primary shadow-sm rounded-xl border border-primary h-fit">
                    <div className="px-6 py-4 border-b border-primary">                        <h3 className="text-lg leading-6 font-semibold text-primary flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Tasks Due Soon (Next 2 Days)
                        </h3>
                    </div>
                    <div className="divide-y divide-primary">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : recentTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <FileText className="w-12 h-12 text-muted mb-4" />
                                <h3 className="text-lg font-medium text-primary mb-2">No tasks yet</h3>
                                <p className="text-secondary text-center">
                                    Your course tasks will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-primary">
                                {recentTasks.map((task) => {
                                    const isExpired = new Date(task.dueDate) < new Date();
                                    const isDueSoon = !isExpired && new Date(task.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

                                    return (
                                        <div
                                            key={task._id}
                                            className={`group p-6 transition-all ${
                                                isExpired 
                                                    ? 'hover:bg-red-50/30 dark:hover:bg-red-900/10' 
                                                    : isDueSoon
                                                    ? 'hover:bg-amber-50/30 dark:hover:bg-amber-900/10'
                                                    : 'hover:bg-secondary/5'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Task Status Icon */}
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    isExpired 
                                                        ? 'bg-red-50 dark:bg-red-900/50' 
                                                        : isDueSoon
                                                        ? 'bg-amber-50 dark:bg-amber-900/50'
                                                        : 'bg-blue-50 dark:bg-blue-900/50'
                                                }`}>
                                                    <FileText className={`w-5 h-5 ${
                                                        isExpired 
                                                            ? 'text-red-600 dark:text-red-400' 
                                                            : isDueSoon
                                                            ? 'text-amber-600 dark:text-amber-400'
                                                            : 'text-blue-600 dark:text-blue-400'
                                                    }`} />
                                                </div>

                                                {/* Task Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-x-4">
                                                        <div className="min-w-0">                                                            <h4 className="font-medium text-lg text-primary truncate pr-4">
                                                                {task.title}
                                                            </h4>
                                                            <div className="mt-1 flex flex-col gap-1">
                                                                <p className="text-sm font-medium">
                                                                    <span className="text-indigo-600 dark:text-indigo-400">Course Name: </span>
                                                                    <span className="text-secondary">{task.courseName}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                                                            isExpired 
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' 
                                                                : isDueSoon
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                                                        }`}>
                                                            {isExpired ? 'Expired' : 'Due'}: {formatDate(task.dueDate)}
                                                        </div>
                                                    </div>
                                                    
                                                    {task.description && (
                                                        <div className="mt-2">
                                                            <p className="text-sm">
                                                                <span className="font-medium text-indigo-600 dark:text-indigo-400">Task Description: </span>
                                                                <span className="text-secondary">{task.description}</span>
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Task Meta */}
                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <div className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-md ${
                                                            isExpired 
                                                                ? 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                                                : isDueSoon
                                                                ? 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                : 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
                                                            <span className="whitespace-nowrap">
                                                                {isExpired 
                                                                    ? 'Expired'
                                                                    : isDueSoon
                                                                    ? 'Due Soon'
                                                                    : 'Upcoming'}
                                                            </span>
                                                        </div>
                                                        {task.score !== undefined && (
                                                            <div className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                <Star className="w-3 h-3 mr-1" />
                                                                <span>Score: {task.score}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;