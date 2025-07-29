require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/AdminModel');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const username = 'admin';
  const email = 'admin@propertyeweyinternational.com';
  const password = '12345678';

  const exists = await Admin.findOne({
    $or: [{ email }, { username }],
  });

  if (exists) {
    console.log('❌ Admin with that username or email already exists');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({
    username,
    email,
    password: hashed,
    role: 'admin',
  });

  console.log('✅ Admin created successfully');
  process.exit();
};

createAdmin();
