const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {sendVerificationEmail} = require("../config/email")

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public

// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password, profileImageUrl, adminInviteToken } =
//             req.body;
//         // Check if user already exists
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         // Determine user role: Admin if correct token is provided, otherwise Member
//         let role = "member";
//         if (
//             adminInviteToken &&
//             adminInviteToken === process.env.ADMIN_INVITE_TOKEN
//         ) {
//             role = "admin"
//         }

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // Create new user
//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             profileImageUrl,
//             role,
//         });

//         // Return user data with JWT
//         res.status(201).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             profileImageUrl: user.profileImageUrl,
//             token: generateToken(user._id),
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });

//     };
// }




const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    let role = "member";
    if (adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
      role = "admin";
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
      emailVerified: false,
      emailVerificationToken: emailToken,
      emailVerificationExpires: Date.now() + 1000 * 60 * 60, // 1 hour
    });

    // 📧 Send email
    await sendVerificationEmail(email, emailToken);

    res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.query;

//     const user = await User.findOne({
//       emailVerificationToken: token,
//       emailVerificationExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "Invalid or expired verification link",
//       });
//     }

//     user.emailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;

//     await user.save();

//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



// @desc Login user
// @route POST /api/auth/login
// @access Public

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    // ✅ Apply pending email if exists
    if (user.pendingEmail) {
      user.email = user.pendingEmail;
      user.pendingEmail = undefined;
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({
      message: "Email verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.emailVerified) {
  return res.status(403).json({
    message: "Please verify your email before logging in",
  });
}


        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Return user data with JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (Requires JWT)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private (Requires JWT)

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
// const updateUserProfile = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* ================= EMAIL UPDATE ================= */
//     if (email && email !== user.email) {
//       const emailExists = await User.findOne({
//         email,
//         _id: { $ne: user._id },
//       });

//       if (emailExists) {
//         return res.status(400).json({
//           message: "Email already in use",
//         });
//       }

//       user.email = email;
//     }

//     /* ================= BASIC FIELDS ================= */
//     if (name) user.name = name;
//     if (phone !== undefined) user.phone = phone;

//     /* ================= PASSWORD UPDATE ================= */
//     if (password) {
//       if (password.length < 6) {
//         return res.status(400).json({
//           message: "Password must be at least 6 characters",
//         });
//       }

//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }

//     const updatedUser = await user.save();

//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       phone: updatedUser.phone,
//       role: updatedUser.role,
//       profileImageUrl: updatedUser.profileImageUrl,
//       token: generateToken(updatedUser._id), // optional but OK
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ================= EMAIL UPDATE FLOW ================= */
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      // Generate verification token
      const emailToken = crypto.randomBytes(32).toString("hex");

      user.pendingEmail = email;
      user.emailVerified = false;
      user.emailVerificationToken = emailToken;
      user.emailVerificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour

      await sendVerificationEmail(email, emailToken);

      await user.save();

      return res.status(200).json({
        message:
          "Verification email sent to new email address. Please verify to complete email update.",
      });
    }

    /* ================= BASIC FIELDS ================= */
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    /* ================= PASSWORD UPDATE ================= */
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      profileImageUrl: updatedUser.profileImageUrl,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, verifyEmail };