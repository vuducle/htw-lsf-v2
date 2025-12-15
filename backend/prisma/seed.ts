import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'dzemals_super_app',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

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

  console.log('Created teacher user:', teacherUser);

  // Create Teacher
  const teacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
    },
  });

  console.log('Created teacher:', teacher);

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

  console.log('Created student user:', studentUser);

  // Create Student
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
    },
  });

  console.log('Created student:', student);

  // Create a Course with schedule
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

  console.log('Created course with schedule:', course);

  // Enroll student in course
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
    },
  });

  console.log('Created enrollment:', enrollment);

  // Create a grade
  const grade = await prisma.grade.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      teacherId: teacher.id,
      grade: 4.5,
    },
  });

  console.log('Created grade:', grade);

  console.log('Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
