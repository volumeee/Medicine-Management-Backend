const User = require("../models/user");
const PasswordResetToken = require("../models/passwordResetToken");
const Role = require("../models/role");
const { ROLES } = require("../utils/constants");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper function to send OTP
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: '"Pharmacy App"',
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}`,
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

exports.createNewUser = async (req, res) => {
  try {
    const { username, email, password, roleName } = req.body;

    const requiredFields = ["username", "email", "password", "roleName"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Missing required fields",
        data: {
          missingFields: missingFields.join(", "),
        },
      });
    }

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Username already exists",
        data: null,
      });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Email already exists",
        data: null,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let role = await Role.findByName(roleName);
    if (!role) {
      role = await Role.create(roleName, `Default role for ${roleName}`);
    }

    const createdUser = await User.create(
      username,
      email,
      passwordHash,
      role.id
    );

    delete createdUser.password_hash;

    res.status(201).json({
      status: 201,
      error: false,
      message: "User created successfully",

      user: createdUser,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.updateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.update(userId, { username: newUsername });

    if (updatedUser) {
      res.json({
        status: 200,
        error: false,
        message: "Username updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.update(userId, { email: newEmail });

    if (updatedUser) {
      res.json({
        status: 200,
        error: false,
        message: "Email updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 401,
        error: true,
        message: "Unauthorized: User not authenticated",
        data: null,
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Current password is incorrect",
        data: null,
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.update(userId, {
      password_hash: newPasswordHash,
    });

    if (!updatedUser) {
      return res.status(500).json({
        status: 500,
        error: true,
        message: "Failed to update password",
        data: null,
      });
    }

    res.json({
      status: 200,
      error: false,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId, newRoleId } = req.body;
    const adminId = req.user.id;

    const adminUser = await User.findById(adminId);
    if (!adminUser || !adminUser.roles.some((role) => role.id === 1)) {
      return res.status(403).json({
        status: 403,
        error: true,
        message: "Unauthorized: Only admins can update user roles",
        data: null,
      });
    }

    const validRoleIds = [1, 2, 3];
    if (!validRoleIds.includes(newRoleId)) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Invalid role ID",
        data: null,
      });
    }

    const updatedUser = await User.update(userId, { role_id: newRoleId });

    if (updatedUser) {
      res.json({
        status: 200,
        error: false,
        message: "User role updated successfully",
        data: {
          user: updatedUser,
        },
      });
    } else {
      res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, roleName } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }

    const updateData = {};

    if (username && username !== user.username) {
      const existingUsername = await User.findByUsername(username);
      if (existingUsername && existingUsername.id !== parseInt(id)) {
        return res.status(400).json({
          status: 400,
          error: true,
          message: "Username already exists",
          data: null,
        });
      }
      updateData.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        return res.status(400).json({
          status: 400,
          error: true,
          message: "Email already exists",
          data: null,
        });
      }
      updateData.email = email;
    }

    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updateData.password_hash = passwordHash;
    }

    if (roleName) {
      let role = await Role.findByName(roleName);
      if (!role) {
        role = await Role.create(roleName, `Default role for ${roleName}`);
      }
      updateData.role_id = role.id;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "No fields to update",
        data: null,
      });
    }

    const updatedUser = await User.update(id, updateData);

    if (updatedUser) {
      delete updatedUser.password_hash;
      res.json({
        status: 200,
        error: false,
        message: "User updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }
    const generateNumericToken = (length = 5) => {
      return crypto.randomInt(10000, 100000).toString().padStart(5, "0");
    };
    const token = generateNumericToken();
    const expires_at = new Date(Date.now() + 30 * 60 * 1000);

    console.log("Generated token:", token);
    console.log("Expiration time:", expires_at);

    await PasswordResetToken.create(user.id, token, expires_at);
    await sendOTP(email, token);

    res.json({
      status: 200,
      error: false,
      message: "Password reset OTP sent to your email",
      data: null,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }

    const resetToken = await PasswordResetToken.findByToken(otp);

    if (!resetToken) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Invalid OTP",
        data: null,
      });
    }

    if (new Date() > resetToken.expires_at) {
      await PasswordResetToken.deleteByUserId(user.id);
      return res.status(400).json({
        status: 400,
        error: true,
        message: "Expired OTP",
        data: null,
      });
    }

    if (resetToken.user_id !== user.id) {
      return res.status(400).json({
        status: 400,
        error: true,
        message: "OTP does not match user",
        data: null,
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await User.update(user.id, { password_hash: newPasswordHash });

    // Delete the used token
    await PasswordResetToken.deleteByUserId(user.id);

    res.json({
      status: 200,
      error: false,
      message: "Password reset successfully",
      data: null,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalCount = await User.count();
    const users = await User.findAll(limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      status: 200,
      error: false,
      message: "Success",
      data: {
        meta: {
          total: totalCount,
        },
        page: {
          current: page,
          total: totalPages,
          size: limit,
        },
        data: users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    if (
      requestingUser.roleId !== ROLES.ADMIN &&
      requestingUser.id !== parseInt(id)
    ) {
      return res.status(403).json({
        status: 403,
        error: true,
        message: "Access denied. You can only view your own profile.",
        data: null,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }

    res.json({
      status: 200,
      error: false,
      message: "User found successfully",
      data: {
        user: user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Server error",
      data: null,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (user) {
      await User.delete(id);
      res.json({
        status: 200,
        error: false,
        message: "User deleted successfully",
        data: null,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: true,
        message: "User not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: error.message,
      data: null,
    });
  }
};
