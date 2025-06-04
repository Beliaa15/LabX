function checkRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res
                .status(401)
                .json({ message: 'Unauthorized - No user found' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden - Requires ${roles.join(' or ')} role`,
            });
        }

        next();
    };
}

const isAdmin = checkRole(['admin']);
const isTeacher = checkRole(['teacher', 'admin']);
const isStudent = checkRole(['student']);

module.exports = {
    checkRole,
    isAdmin,
    isTeacher,
    isStudent,
};
