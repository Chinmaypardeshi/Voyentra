/**
 * Voyentra Role-Based Access Control (RBAC) & Authentication Middleware
 * Enforces role verification across protected REST API endpoints.
 */

function authenticateUser(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.user_id || '22222222-aaaa-bbbb-cccc-000000000002';
  const userRole = req.headers['x-user-role'] || req.query.user_role || 'traveler';

  req.user = {
    id: userId,
    role: userRole.toLowerCase()
  };

  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role || req.headers['x-user-role'] || 'traveler';
    const normalizedRole = userRole.toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowed.includes(normalizedRole)) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN_ACCESS',
        message: `Security Access Denied: Action requires one of [${allowedRoles.join(', ')}] permissions, but your authenticated role is '${userRole}'.`,
        required_roles: allowedRoles,
        user_role: userRole
      });
    }

    next();
  };
}

module.exports = {
  authenticateUser,
  requireRole
};
