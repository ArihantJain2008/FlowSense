const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const generateToken = require("../utils/generateToken");

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    themePreference: user.themePreference,
    currency: user.currency,
    notificationSettings: user.notificationSettings || {
      budgetAlerts: true,
      goalReminders: true,
      recurringReminders: true,
      salaryReminders: false,
      monthlySummary: true,
      customReminders: true,
    },
  };
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      ...serializeUser(user),
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    res.json({
      ...serializeUser(user),
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  res.json(serializeUser(req.user));
};

const updateProfileSettings = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        ...(req.body.themePreference ? { themePreference: req.body.themePreference } : {}),
        ...(req.body.currency ? { currency: req.body.currency } : {}),
        ...(req.body.notificationSettings ? { notificationSettings: req.body.notificationSettings } : {}),
      },
    });

    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfileSettings,
};
