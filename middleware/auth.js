const { validateToken } = require("../service/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    console.log("in middleware")
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      next();
    } else {
      try {
        const userPayload = validateToken(tokenCookieValue);
        req.user = userPayload;
        res.status(200).json({
          success: true,
          token: tokenCookieValue,
        });
        //  next();
      } catch (err) {
        console.log(err);
        res.status(200).send("Server side error in middleWare");
      }
    }
  };
}

function restrictToLoggedinUserOnly(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];

    if (!tokenCookieValue) return res.send("login");
    const userPayload = validateToken(tokenCookieValue);

    if (!userPayload) return res.send("login");

    req.user = userPayload;
    next();
  };
}

function authorizeRoles(...roles) {
  console.log(roles);
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({message:`Role: ${req.user.role} is not allowed to access this resource`})
    }
    next();
  };

};

module.exports = {
  checkForAuthenticationCookie,
  restrictToLoggedinUserOnly,
  authorizeRoles,
};
