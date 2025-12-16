import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { Logger} from "@nestjs/common";
import * as dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const logger = new Logger('setupDatabase');
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'dzemals_super_app',
  };

  // First, check if database exists and create if needed
  const adminPool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres',
  });

  try {
    logger.log('🔧 Checking if database exists...');

    const dbCheckResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database],
    );

    if (dbCheckResult.rows.length === 0) {
      logger.log(`📦 Creating database: ${dbConfig.database}...`);
      await adminPool.query(`CREATE DATABASE "${dbConfig.database}"`);
      logger.log(`✅ Database created: ${dbConfig.database}`);
    } else {
      logger.log(`✅ Database already exists: ${dbConfig.database}`);
    }

    await adminPool.end();

    // Connect to the target database for migrations
    const dbPool = new Pool(dbConfig);
    
    // Run manual migrations (Prisma 7.1 with adapters doesn't support migrate commands)
    logger.log('🚀 Running database migrations...');
    
    const createTablesSQL = `
      -- Create User table
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "avatarUrl" TEXT,
        "refreshToken" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Teacher table
      CREATE TABLE IF NOT EXISTS "Teacher" (
        id TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      );

      -- Create Student table
      CREATE TABLE IF NOT EXISTS "Student" (
        id TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      );

      -- Create Course table
      CREATE TABLE IF NOT EXISTS "Course" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        code TEXT UNIQUE NOT NULL,
        "teacherId" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        room TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("teacherId") REFERENCES "Teacher"(id) ON DELETE CASCADE
      );

      -- Create Schedule table
      CREATE TABLE IF NOT EXISTS "Schedule" (
        id TEXT PRIMARY KEY,
        "courseId" TEXT NOT NULL,
        "dayOfWeek" INTEGER NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        room TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("courseId") REFERENCES "Course"(id) ON DELETE CASCADE,
        UNIQUE ("courseId", "dayOfWeek", "startTime")
      );

      -- Create Enrollment table
      CREATE TABLE IF NOT EXISTS "Enrollment" (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("studentId") REFERENCES "Student"(id) ON DELETE CASCADE,
        FOREIGN KEY ("courseId") REFERENCES "Course"(id) ON DELETE CASCADE,
        UNIQUE ("studentId", "courseId")
      );

      -- Create Grade table
      CREATE TABLE IF NOT EXISTS "Grade" (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        grade DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("studentId") REFERENCES "Student"(id) ON DELETE CASCADE,
        FOREIGN KEY ("courseId") REFERENCES "Course"(id) ON DELETE CASCADE,
        FOREIGN KEY ("teacherId") REFERENCES "Teacher"(id) ON DELETE CASCADE,
        UNIQUE ("studentId", "courseId", "teacherId")
      );
    `;

    await dbPool.query(createTablesSQL);
    logger.log('✅ Database schema created!');

    // Keep dbPool open for Prisma Client adapter
    
    // Initialize Prisma Client with adapter for seeding
    const adapter = new PrismaPg(dbPool);
    const prisma = new PrismaClient({ adapter });

    // Now check if we need to seed
    logger.log('🌱 Checking if database needs seeding...');
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      logger.log('📝 Seeding database...');

      // Create Teacher User
      const teacherUser = await prisma.user.create({
        data: {
          email: 'julia.nguyen@example.com',
          password: await bcrypt.hash('Teacher123!', 10),
          firstName: 'Julia',
          lastName: 'Nguyen',
          avatarUrl: 'https://api.example.com/avatars/julia-nguyen.jpg',
        },
      });
      logger.log(
        `  ✅ Created teacher user: Julia Nguyen (ID: ${teacherUser.id})`,
      );

      // Create Teacher
      const teacher = await prisma.teacher.create({
        data: {
          userId: teacherUser.id,
        },
      });
      logger.log(`  ✅ Created teacher profile (ID: ${teacher.id})`);

      // Create Student User
      const studentUser = await prisma.user.create({
        data: {
          email: 'triesnha.ameilya@example.com',
          password: await bcrypt.hash('Student123!', 10),
          firstName: 'Triesnha',
          lastName: 'Ameilya',
          avatarUrl: 'https://api.example.com/avatars/triesnha-ameilya.jpg',
        },
      });
      logger.log(
        `  ✅ Created student user: Triesnha Ameilya (ID: ${studentUser.id})`,
      );

      // Create Student
      const student = await prisma.student.create({
        data: {
          userId: studentUser.id,
        },
      });
      logger.log(`  ✅ Created student profile (ID: ${student.id})`);


      const student2User = await prisma.user.create({
        data: {
          email: 'vuduc.le@example.com',
          password: await bcrypt.hash('Student456!', 10),
          firstName: 'Vu Duc',
          lastName: 'Le',
          avatarUrl: 'https://api.example.com/avatars/vu-duc-le.jpg',
        },
      });
      logger.log(
        `  ✅ Created student user: Vu Duc Le (ID: ${student2User.id})`,
      );

      // Create Student 2
      const student2 = await prisma.student.create({
        data: {
          userId: student2User.id,
        },
      });
      logger.log(`  ✅ Created student profile (ID: ${student2.id})`);


      const student3User = await prisma.user.create({
        data: {
          email: 'armin.dorri@example.com',
          password: await bcrypt.hash('Student789!', 10),
          firstName: 'Armin',
          lastName: 'Dorri',
          avatarUrl: 'https://api.example.com/avatars/armin-dorri.jpg',
        },
      });
      logger.log(
        `  ✅ Created student user: Armin Dorri (ID: ${student3User.id})`,
      );

      // Create Student 3
      const student3 = await prisma.student.create({
        data: {
          userId: student3User.id,
        },
      });
      logger.log(`  ✅ Created student profile (ID: ${student3.id})`);

      // Create Course with schedule
      const course = await prisma.course.create({
        data: {
          title: 'Introduction to Computer Science',
          description: 'Learn the fundamentals of computer science',
          code: 'CS101',
          teacherId: teacher.id,
          startDate: new Date('2025-10-01'),
          endDate: new Date('2026-03-31'),
          room: 'Room 101',
          schedule: {
            create: [
              {
                dayOfWeek: 1, // Monday
                startTime: '10:00',
                endTime: '12:00',
                room: 'Room 101',
              },
              {
                dayOfWeek: 3, // Wednesday
                startTime: '10:00',
                endTime: '12:00',
                room: 'Room 101',
              },
            ],
          },
        },
      });
      logger.log(`  ✅ Created course: CS101 with schedule (ID: ${course.id})`)

      // Enroll student
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
        },
      });
      logger.log(
        `  ✅ Enrolled student in CS101 (Enrollment ID: ${enrollment.id})`,
      );

      // Create grade
      const grade = await prisma.grade.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          teacherId: teacher.id,
          grade: 4.5,
        },
      });
      logger.log(`  ✅ Created grade: 4.5 (Grade ID: ${grade.id})`);

      logger.log('✅ Database seeded successfully!');
    } else {
      logger.log('✅ Database already has users, skipping seed');
    }

    await prisma.$disconnect();
    await dbPool.end();
  } catch (error) {
    logger.error('❌ Database setup failed:', error);
    throw error;
  }
}

export default setupDatabase;
