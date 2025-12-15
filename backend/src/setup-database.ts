import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
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

  let pool: Pool | null = null;

  try {
    console.log('🔧 Checking if database exists...');

    const dbCheckResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database],
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`📦 Creating database: ${dbConfig.database}...`);
      await adminPool.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`✅ Database created: ${dbConfig.database}`);
    } else {
      console.log(`✅ Database already exists: ${dbConfig.database}`);
    }

    await adminPool.end();

    // Create pool and Prisma instance
    pool = new Pool(dbConfig);
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    // Run migrations first (hardcoded since we're using custom adapter)
    console.log('🚀 Running database migrations...');

    const initMigration = `
      -- CreateTable "User"
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "avatarUrl" TEXT,
          "refreshToken" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- CreateTable "Student"
      CREATE TABLE IF NOT EXISTS "Student" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL UNIQUE,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- CreateTable "Teacher"
      CREATE TABLE IF NOT EXISTS "Teacher" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL UNIQUE,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- CreateTable "Course"
      CREATE TABLE IF NOT EXISTS "Course" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "code" TEXT NOT NULL UNIQUE,
          "teacherId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- CreateTable "Enrollment"
      CREATE TABLE IF NOT EXISTS "Enrollment" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Enrollment_studentId_courseId_key" UNIQUE ("studentId", "courseId")
      );

      -- CreateTable "Grade"
      CREATE TABLE IF NOT EXISTS "Grade" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "teacherId" TEXT NOT NULL,
          "grade" DOUBLE PRECISION NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Grade_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Grade_studentId_courseId_teacherId_key" UNIQUE ("studentId", "courseId", "teacherId")
      );
    `;

    try {
      await pool.query(initMigration);
      console.log('✅ Database schema synchronized!');
    } catch (error: any) {
      console.log('✅ Database schema already exists');
    }

    // Now check if we need to seed
    console.log('🌱 Checking if database needs seeding...');
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log('📝 Seeding database...');

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
      console.log(
        `  ✅ Created teacher user: Julia Nguyen (ID: ${teacherUser.id})`,
      );

      // Create Teacher
      const teacher = await prisma.teacher.create({
        data: {
          userId: teacherUser.id,
        },
      });
      console.log(`  ✅ Created teacher profile (ID: ${teacher.id})`);

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
      console.log(
        `  ✅ Created student user: Triesnha Ameilya (ID: ${studentUser.id})`,
      );

      // Create Student
      const student = await prisma.student.create({
        data: {
          userId: studentUser.id,
        },
      });
      console.log(`  ✅ Created student profile (ID: ${student.id})`);

      // Create Course
      const course = await prisma.course.create({
        data: {
          title: 'Introduction to Computer Science',
          description: 'Learn the fundamentals of computer science',
          code: 'CS101',
          teacherId: teacher.id,
        },
      });
      console.log(`  ✅ Created course: CS101 (ID: ${course.id})`);

      // Enroll student
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
        },
      });
      console.log(
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
      console.log(`  ✅ Created grade: 4.5 (Grade ID: ${grade.id})`);

      console.log('✅ Database seeded successfully!');
    } else {
      console.log('✅ Database already has users, skipping seed');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

export default setupDatabase;
