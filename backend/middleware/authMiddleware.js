const jwt = require("jsonwebtoken");

const verifyRole = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) return res.status(401).json({ message: "No token provided" });

      const token = authHeader.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Invalid token format" });

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });

        // check role
        if (!roles.includes(decoded.role)) {
          return res.status(403).json({ message: "Access denied" });
        }

        req.user = decoded;
        next();
        

      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = verifyRole;
