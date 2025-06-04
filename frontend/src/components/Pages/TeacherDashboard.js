import React, { useState } from 'react';
import { Users, BookOpen, FileText, Calendar } from 'lucide-react';

const TeacherDashboard = () => {
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
        <div className="bg-white shadow rounded-lg p-6 dark:bg-[#2A2A2A]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teacher Dashboard
          </h2>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Overview of your courses and student engagement.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Teaching Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      3
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Total Students
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      135
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-bold text-gray-500 truncate dark:text-white">
                      Pending Grading
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      12
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-[#2A2A2A]">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-white">
                      Upcoming Lectures
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-slate-400">
                      3
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Courses */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Teaching Courses
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {teachingCourses.map((course) => (
                <li key={course.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Next lecture: {course.nextLecture}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                      <span className="ml-2 text-sm text-gray-500 dark:text-slate-400">
                        {course.students} students
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Assignment Statistics */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Assignment Statistics
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {assignmentStats.map((assignment) => (
                <li key={assignment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Due: {assignment.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {assignment.submitted}/{assignment.total} submitted
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lecture Attendance */}
        <div className="bg-white shadow rounded-lg dark:bg-[#2A2A2A]">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Lecture Attendance
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {lectureAttendance.map((lecture) => (
                <li key={lecture.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lecture.course}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Date: {lecture.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {lecture.attended}/{lecture.total} attended
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

export default TeacherDashboard; 