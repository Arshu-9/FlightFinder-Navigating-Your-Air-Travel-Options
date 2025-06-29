const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('Arshad@63044', 10);

    const admin = new User({
      firstName: "Md",
      lastName: "Arshad",
      email: "mdarshu926@gmail.com",
      password: hashedPassword,
      phone: "6304456930",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await admin.save();
    console.log('✅ Default admin user created successfully');
  } catch (err) {
    console.error('❌ Error creating default admin:', err);
  }
};

module.exports = createDefaultAdmin;