import { MOCK_USERS } from './authService';

export const getProfessors = () => {
    // Filter mock users to get only professors
    const professors = MOCK_USERS.filter(user => user.role === 'professor').map(prof => ({
        id: prof.id,
        name: `${prof.firstName} ${prof.lastName}`,
        email: prof.email,
        assignedCourses: prof.courses.length,
        bio: prof.bio,
        location: prof.location
    }));

    return professors;
};

export const assignCourse = (professorId, courseId) => {
    // In a real application, this would make an API call
    // For now, we'll just return a success response
    return {
        success: true,
        message: 'Course assigned successfully'
    };
};

export const unassignCourse = (professorId, courseId) => {
    // In a real application, this would make an API call
    // For now, we'll just return a success response
    return {
        success: true,
        message: 'Course unassigned successfully'
    };
}; 