const JWT = require("jsonwebtoken");

const secret = "workingonaassignment";

function createTokenForUser(user){

   const payload = {
       _id: user._id,
       userName: user.userName,
       userEmail: user.userEmail,
       role:user.role
   };
   const token = JWT.sign(payload, secret);
   return token;
}

function validateToken(token){
   const payload = JWT.verify(token, secret);
   return payload;

}

module.exports = {
    createTokenForUser,
    validateToken,
}