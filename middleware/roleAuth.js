// middleware/roleAuth.js

const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = roleAuth;
