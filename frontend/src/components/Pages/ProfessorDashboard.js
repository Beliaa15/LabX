import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, FileText, BarChart2, Calendar } from 'lucide-react';

const ProfessorDashboard = () => {
    // Sample data - replace with actual API calls
    const [teachingCourses] = useState([
        { id: 1, name: 'Mathematics', students: 45, nextLecture: '2024-04-08' },
        { id: 2, name: 'Physics', students: 38, nextLecture: '2024-04-09' },
        { id: 3, name: 'Computer Science', students: 52, nextLecture: '2024-04-10' }
    ]);

    const [assignmentStats] = useState([
        { id: 1, title: 'Math Assignment 1', submitted: 42, total: 45, dueDate: '2024-04-10' },
        { id: 2, title: 'Physics Lab Report', submitted: 35, total: 38, dueDate: '2024-04-12' },
        { id: 3, title: 'Programming Project', submitted: 48, total: 52, dueDate: '2024-04-15' }
    ]);

    const [lectureAttendance] = useState([
        { id: 1, course: 'Mathematics', date: '2024-04-05', attended: 40, total: 45 },
        { id: 2, course: 'Physics', date: '2024-04-06', attended: 35, total: 38 },
        { id: 3, course: 'Computer Science', date: '2024-04-07', attended: 48, total: 52 }
    ]);

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900">Professor Dashboard</h2>
                <p className="mt-2 text-gray-600">Overview of your courses and student engagement.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Teaching Courses</dt>
                                    <dd className="text-lg font-medium text-gray-900">3</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                                    <dd className="text-lg font-medium text-gray-900">135</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Grading</dt>
                                    <dd className="text-lg font-medium text-gray-900">12</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Lectures</dt>
                                    <dd className="text-lg font-medium text-gray-900">3</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Teaching Courses */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Teaching Courses</h3>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {teachingCourses.map((course) => (
                            <li key={course.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <BookOpen className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                                            <div className="text-sm text-gray-500">Next lecture: {course.nextLecture}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 text-gray-400" />
                                        <span className="ml-2 text-sm text-gray-500">{course.students} students</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Assignment Statistics */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Assignment Statistics</h3>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {assignmentStats.map((assignment) => (
                            <li key={assignment.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                                            <div className="text-sm text-gray-500">Due {assignment.dueDate}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-500">{assignment.submitted}/{assignment.total}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Lecture Attendance */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Lecture Attendance</h3>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {lectureAttendance.map((lecture) => (
                            <li key={lecture.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{lecture.course}</div>
                                            <div className="text-sm text-gray-500">Date: {lecture.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(lecture.attended / lecture.total) * 100}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-500">{lecture.attended}/{lecture.total}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfessorDashboard; 