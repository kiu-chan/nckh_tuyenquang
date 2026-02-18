import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import gameRoutes from './routes/games.js';
import examRoutes from './routes/exams.js';
import User from './models/User.js';

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/exams', examRoutes);

// Seed demo users
const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create([
        {
          email: 'admin@notebooklm.vn',
          password: 'admin123',
          name: 'Administrator',
          role: 'admin',
        },
        {
          email: 'giaovien@notebooklm.vn',
          password: 'teacher123',
          name: 'Nguyễn Văn Giáo',
          role: 'teacher',
        },
        {
          email: 'hocsinh@notebooklm.vn',
          password: 'student123',
          name: 'Trần Thị Học',
          role: 'student',
        },
      ]);
      console.log('Demo users seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding users:', error.message);
  }
};

// Start server
const start = async () => {
  await connectDB();
  await seedUsers();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
