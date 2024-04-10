const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const sendToken = require("../utils/jwtToken");
const validator = require("email-validator");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

async function handleSignup(req, res) {
  const { userName, userEmail, Password } = req.body;
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    if (!userName || !userEmail || !Password)
      return res.status(200).json({ message: "Please fill all the details" });

    const isValid = validator.validate(userEmail);
    if (!isValid) {
      return res.status(400).json({ error: "Email is not valid" });
    }

    // Check if the user already exists
    const user = await User.findOne({ userEmail: userEmail });
    if (user) {
      console.log("User already exist");
      return res.status(200).json({ message: "User already registered" });
    }
    // const verificationToken = uuid.v4().replace(/-/g, "");

    // Create the user
    const newUser = await User.create({
      userName,
      userEmail,
      Password,
    });
    // Pass the newly created user to sendToken function
    sendToken(newUser, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server-side error" });
  }
}

async function handleSignin(req, res) {
  const { userEmail, Password } = req.body;
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }

  if (!userEmail || !Password) {
    return res.status(400).send("PLease enter email and password");
  }

  try {
    const user = await User.findOne({ userEmail: userEmail }).select(
      "+Password"
    );

    if (user && (await user.matchPassword(Password))) {
      console.log("user password is matched ");
      req.user = user;
      sendToken(user, 200, res);
    } else {
      res.status(200).send("Invalid email or password");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("server side error");
  }
}

async function logout(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// Get User Detail
async function getUserDetails(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    // console.log(req.user);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// Forgot Password
async function forgotPassword(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  const user = await User.findOne({ userEmail: req.body.userEmail }).select(
    "+Password"
  );

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  // Get resetPassword token
  const resetToken = user.getResetPasswordToken();
  console.log(resetToken);
  try {
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    console.error(err);
    // Handle validation errors
    return res.status(400).json({ message: "Validation error", error: err });
  }

  const resetPasswordUrl = `
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jojobarnwal98@gmail.com",
        pass: "zpsnsiosskbwjqca",
      },
    });
    const mailOptions = {
      from: "jojobarnwal98@gmail.com",
      to: req.body.userEmail,
      subject: "Password Recovery",
      text: message,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        res.send("Error sending verification email");
        return;
      }
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.userEmail} successfully`,
      });
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json({ success: false, message: err.message });
  }
}

// Reset Password

async function resetPassword(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset Password Token is invalid or has been expired",
      });
    }

    const Password = req.body.Password;
    if (Password !== req.body.confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password must be similar to confirm Password" });
    }
    if (Password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    user.Password = req.body.Password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// update User password
async function updatePassword(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    const user = await User.findById(req.user._id).select("+Password");
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const confirmPassword = req.body.confirmPassword;

    const isPasswordMatched = await user.matchPassword(oldPassword);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    user.Password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all users(admin)
async function getAllUser(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get single user (admin)
async function getSingleUser(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(400)
        .json({ message: `User does not exist with Id: ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// update User Role -- Admin
async function updateUserRole(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    const newUserData = {
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete User --Admin
async function deleteUser(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(400)
        .json({ message: `User does not exist with Id: ${req.params.id}` });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  handleSignup,
  handleSignin,
  logout,
  getUserDetails,
  forgotPassword,
  resetPassword,
  updatePassword,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
};

// send verification mail
// const message = `Hello ${userName},
//     Please click the following link to verify your email address:

//     http://localhost:7000/auth/verify?token=${verificationToken}

//     Best regards,
//     The Team`;

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "jojobarnwal98@gmail.com",
//     pass: "zpsnsiosskbwjqca",
//   },
// });
// const mailOptions = {
//   from: "jojobarnwal98@gmail.com",
//   to: req.body.userEmail,
//   subject: "Verify Your Email Address",
//   text: message,
// };
// transporter.sendMail(mailOptions, (err, info) => {
//   if (err) {
//     console.error(err);
//     res.send("Error sending verification email");
//     return;
//   }

//   res.send(
//     "Verification email sent. Please check your email to verify your account."
//   );
// });

//  Email verification for register
// async function verify(req,res,next) {
//   const verificationToken = req.query.token;
//   const user = await User.findOne({ verificationToken: verificationToken });
//   if (user) {
//     await User.updateOne(
//       { verificationToken: verificationToken },
//       { $set: { verified: true } }
//     );
//     res.send(
//       "Email verification successful. You can now log in to your account."
//     );
//   } else {
//     res.send("Verification failed. Please sign up again.");
//   }
// }
