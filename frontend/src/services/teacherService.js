import { MOCK_USERS } from './authService';

export const getTeachers = () => {
    // Filter mock users to get only teachers
    const teachers = MOCK_USERS.filter(user => user.role === 'teacher').map(teacher => ({
        id: teacher.id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.email,
        assignedCourses: teacher.courses.length,
        bio: teacher.bio,
        location: teacher.location
    }));

    return teachers;
};

export const assignCourse = (teacherId, courseId) => {
    // In a real application, this would make an API call
    // For now, we'll just return a success response
    return {
        success: true,
        message: 'Course assigned successfully'
    };
};

export const unassignCourse = (teacherId, courseId) => {
    // In a real application, this would make an API call
    // For now, we'll just return a success response
    return {
        success: true,
        message: 'Course unassigned successfully'
    };
}; 