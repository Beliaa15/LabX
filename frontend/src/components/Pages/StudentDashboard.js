import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Users,
  Folder,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserCourses } from "../../services/courseService";
import { getCourseTasksById } from "../../services/taskService";
import { getFolders } from "../../services/folderService";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

  // Memoized stats calculation
  const stats = useMemo(
    () => ({
      totalCourses: courses.length,
      totalTasks: allTasks.length,
      totalFolders: allFolders.length,
    }),
    [courses.length, allTasks.length, allFolders.length]
  );

  // Memoized recent tasks calculation
  const recentTasks = useMemo(() => {
    const now = new Date();
    return allTasks
      .filter((task) => {
        const dueDate = new Date(task.dueDate);
        return dueDate >= now;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  }, [allTasks]);

  // Single useEffect with proper cleanup
  useEffect(() => {
    if (dataFetched) return;

    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch courses
        const coursesData = await getUserCourses();
        if (!isMounted) return;

        setCourses(coursesData || []);

        if (!coursesData?.length) {
          setDataFetched(true);
          setLoading(false);
          return;
        }

        // Batch fetch tasks and folders
        const courseIds = coursesData.map((course) => course._id);

        const taskPromises = courseIds.map(async (courseId) => {
          try {
            const course = coursesData.find((c) => c._id === courseId);
            const tasksResponse = await getCourseTasksById(courseId);
            const courseTasks = tasksResponse.tasks || [];

            return courseTasks.map((task) => {
              const courseTaskData = task.courseTasks?.find(
                (ct) => ct.course === courseId
              );
              return {
                ...task,
                courseName: course?.name || "Unknown Course",
                courseId: courseId,
                dueDate: courseTaskData?.dueDate,
              };
            });
          } catch (error) {
            console.error(`Failed to fetch tasks for course ${courseId}:`, error);
            return [];
          }
        });

        const folderPromises = courseIds.map(async (courseId) => {
          try {
            const response = await getFolders(courseId);
            return response.folders || [];
          } catch (error) {
            console.error(`Failed to fetch folders for course ${courseId}:`, error);
            return [];
          }
        });

        const [taskResults, folderResults] = await Promise.all([
          Promise.all(taskPromises),
          Promise.all(folderPromises),
        ]);

        if (!isMounted) return;

        const allTasksData = taskResults.flat();
        const allFoldersData = folderResults.flat();

        setAllTasks(allTasksData);
        setAllFolders(allFoldersData);
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) setDataFetched(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [dataFetched]); // Only depend on dataFetched flag

  const formatDate = useCallback(
    (dateString) => {
      if (!dateString) return "No due date";
      const date = new Date(dateString);
      if (window.innerWidth < 640) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="surface-primary shadow-sm rounded-xl p-6 border border-primary">
        <h2 className="text-2xl font-bold text-primary">Welcome back!</h2>
        <p className="mt-2 text-secondary">
          {loading
            ? "Loading your overview..."
            : `You're enrolled in ${stats.totalCourses} courses`}
        </p>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                    {loading ? "..." : stats.totalCourses}
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
                    {loading ? "..." : stats.totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="surface-primary overflow-hidden shadow-sm rounded-xl border border-primary">
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
                    {loading ? "..." : stats.totalFolders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course List */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border-b border-primary">
            <h3 className="text-lg leading-6 font-semibold text-primary flex items-center">
              <BookOpen className="w-5 h-5 mr-2" /> Recent Courses
            </h3>
            <span className="text-sm text-secondary">
              {loading
                ? "Loading..."
                : `Showing ${Math.min(4, courses.length)} of ${
                    courses.length
                  } courses`}
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
                <h3 className="text-lg font-medium text-primary mb-2">
                  No courses yet
                </h3>
                <p className="text-secondary text-center">
                  Enroll in a course to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-primary">
                {courses
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
                  .slice(0, 4) // Take only the 4 most recent courses
                  .map((course) => (
                    <div
                      key={course._id}
                      onClick={() => navigate(`/my-courses/${course._id}`)}
                      className="p-6 hover:bg-secondary/5 transition-colors group cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Course Info - Left Side */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center gap-3 mb-2">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-primary font-medium text-lg truncate">
                                {course.name}
                              </h4>
                              {course.teacher && (
                                <p className="text-sm text-secondary truncate">
                                  Prof. {course.teacher.firstName}{" "}
                                  {course.teacher.lastName}
                                </p>
                              )}
                              {course.description && (
                                <p className="text-sm text-secondary line-clamp-2 mt-1">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats - Right Side */}
                        <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 self-end sm:self-center">
                          {" "}
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {course.tasks?.length || 0}
                              </span>
                              <span className="ml-1 text-xs text-blue-600/80 dark:text-blue-400/80">
                                Tasks
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50">
                            <Folder className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <div>
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {course.folders?.length || 0}
                              </span>
                              <span className="ml-1 text-xs text-amber-600/80 dark:text-amber-400/80">
                                Folders
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>{" "}
        {/* Recent Tasks */}
        <div className="surface-primary shadow-sm rounded-xl border border-primary h-fit">
          {" "}
          <div className="px-6 py-4 border-b border-primary">
            {" "}
            <h3 className="text-lg leading-6 font-semibold text-primary flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Most Urgent Tasks
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
                <h3 className="text-lg font-medium text-primary mb-2">
                  No tasks yet
                </h3>
                <p className="text-secondary text-center">
                  Your course tasks will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-primary">
                {recentTasks.map((task) => {
                  const isExpired = new Date(task.dueDate) < new Date();
                  const isDueSoon =
                    !isExpired &&
                    new Date(task.dueDate) <
                      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      onClick={() => navigate("/tasks")}
                      key={task._id}
                      className={`group p-4 sm:p-6 transition-all cursor-pointer ${
                        isExpired
                          ? "hover:bg-red-50/30 dark:hover:bg-red-900/10"
                          : isDueSoon
                          ? "hover:bg-amber-50/30 dark:hover:bg-amber-900/10"
                          : "hover:bg-secondary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Task Status Icon */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                            isExpired
                              ? "bg-red-50 dark:bg-red-900/50"
                              : isDueSoon
                              ? "bg-amber-50 dark:bg-amber-900/50"
                              : "bg-blue-50 dark:bg-blue-900/50"
                          }`}
                        >
                          <FileText
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              isExpired
                                ? "text-red-600 dark:text-red-400"
                                : isDueSoon
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                        </div>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-x-4">
                            <div className="min-w-0">
                              <h4 className="font-medium text-base sm:text-lg text-primary truncate">
                                {task.title}
                              </h4>
                              <p className="text-sm font-medium mt-0.5 text-secondary truncate">
                                {task.courseName}
                              </p>
                            </div>

                            {/* Due Date Tag - Responsive */}
                            <div
                              className={`inline-flex items-center text-xs sm:text-sm px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                isExpired
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                                  : isDueSoon
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                              }`}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(task.dueDate)}
                            </div>
                          </div>

                          {/* Description - Collapsible on mobile */}
                          {task.description && (
                            <div className="mt-2 hidden sm:block">
                              <p className="text-sm text-secondary line-clamp-2">
                                {task.description}
                              </p>
                            </div>
                          )}

                          {/* Task Meta - More compact on mobile */}
                          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2">
                            <div
                              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 sm:py-1 rounded-md ${
                                isExpired
                                  ? "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : isDueSoon
                                  ? "bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              }`}
                            >
                              {isExpired
                                ? "Expired"
                                : isDueSoon
                                ? "Due Soon"
                                : "Upcoming"}
                            </div>
                            {task.score !== undefined && (
                              <div className="inline-flex items-center text-xs font-medium px-2 py-0.5 sm:py-1 rounded-md bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <Star className="w-3 h-3 mr-1" />
                                {task.score}
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
