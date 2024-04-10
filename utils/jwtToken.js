// Create Token and saving in cookie

const { createTokenForUser } = require("../service/authentication");

const sendToken = async (user, statusCode, res) => {
  try {
    const token = await createTokenForUser(user);

    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    console.log("in send function");
    // Send only the token in the response, not the entire user object
    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Error sending token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = sendToken;

