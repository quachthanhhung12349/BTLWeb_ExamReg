require('dotenv').config();
const mongoose = require('mongoose');

// Fake data generators
const firstNames = ['Lý', 'Trần', 'Nguyễn', 'Hoàng', 'Võ', 'Phan', 'Đặng', 'Bùi', 'Đinh', 'Phạm'];
const lastNames = ['Đức Tú', 'Văn A', 'Thị B', 'Minh C', 'Hùng D', 'Linh E', 'Phương F', 'Quyền G', 'Thanh H', 'Kiên I'];
const classes = ['K68I-CS1', 'K68I-CS2', 'K68I-CS3', 'K68I-SE1', 'K68I-IT1'];
const campuses = ['Giảng đường Xuân Thuỷ', 'Giảng đường Tôn Thất Thuyết', 'Giảng đường Kiều Mai'];
const rooms = ['A101', 'A102', 'A103', 'B201', 'B202', 'C301', 'C302'];
const courses = ['INT2204 - Lập trình Web', 'INT2205 - Cơ sở dữ liệu', 'INT2206 - Hệ điều hành', 'INT2207 - Mạng máy tính', 'INT2208 - Lập trình C++'];
const permissions = ['view_students', 'add_students', 'edit_students', 'delete_students', 'manage_exams', 'send_notifications'];
const notificationTitles = ['Thông báo lịch thi', 'Cập nhật điểm', 'Thông báo đặc biệt', 'Nhắc nhở nộp bài', 'Kết quả tuyển sinh'];
const notificationTexts = [
  'Kỳ thi sắp tới vào ngày hôm sau',
  'Điểm của bạn đã được cập nhật',
  'Hãy kiểm tra thông tin cá nhân',
  'Hạn chót nộp bài là ngày mai',
  'Bạn đã được chấp thuận'
];
const deleteReasons = ['Buộc thôi học', 'Thôi học', 'Đã tốt nghiệp', 'Nguyên nhân khác'];

// Utility functions
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomEmail() {
  return `user${Math.floor(Math.random() * 99999)}@vnu.edu.vn`;
}

function randomDate(start = new Date(2024, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone() {
  return '0' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
}

function randomCCCD() {
  return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
}

// Seed function


async function seed() {
    console.log(process.env.MONGO_URI)
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    const examroomsExists = collections.some(col => col.name === 'exam_rooms');
    console.log(`📋 Exam rooms collection exists: ${examroomsExists}`);

    // Clear existing data
    console.log('🗑️  Clearing existing collections...');
    await db.collection('students').deleteMany({});
    await db.collection('staffs').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('exam_rooms').deleteMany({});
    await db.collection('exams').deleteMany({});
    await db.collection('notifications').deleteMany({});
    console.log('  ✓ Cleared existing data');

    // Generate Exam Rooms first
    console.log('🏫 Generating Exam Rooms...');
    const examRoomDocs = [];
    for (let i = 0; i < 7; i++) {
      examRoomDocs.push({
        roomId: rooms[i],
        campus: randomElement(campuses),
        room: `Phòng ${rooms[i]}`,
        maxStudents: 50 + Math.floor(Math.random() * 30),
        
      });
    }
    const examRoomResult = await db.collection('exam_rooms').insertMany(examRoomDocs);
    const examRoomIds = Object.values(examRoomResult.insertedIds);
    console.log(`  ✓ Inserted ${examRoomIds.length} exam rooms`);

    // Generate staffs
    console.log('👥 Generating staffs...');
    const staffDocs = [];
    for (let i = 0; i < 3; i++) {
      staffDocs.push({
        name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        email: `staffs${i}@vnu.edu.vn`,
        account: {
          username: `staffs${i}`,
          password: 'hashed_password_here', // In production, use bcrypt
          role: 'staffs',
          permissions: permissions.slice(0, Math.floor(Math.random() * 3) + 1)
        },
        sentNotifications: []
      });
    }
    const staffResult = await db.collection('staffs').insertMany(staffDocs);
    const staffIds = Object.values(staffResult.insertedIds);
    console.log(`  ✓ Inserted ${staffIds.length} staffs`);

    // Generate Courses
    console.log('📚 Generating Courses...');
    const courseDocs = [];
    for (let i = 0; i < 5; i++) {
      const courseId = `INT220${4 + i}`;
      courseDocs.push({
        courseId,
        courseName: courses[i],
        credits: 2 + Math.floor(Math.random() * 4),
        professor: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        currentEnrollment: 0,
        enrolledStudents: [],
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: `${8 + Math.floor(Math.random() * 8)}:00 - ${9 + Math.floor(Math.random() * 8)}:00`,
          location: `${randomElement(rooms)} - ${randomElement(campuses)}`
        }
      });
    }
    const courseResult = await db.collection('courses').insertMany(courseDocs);
    const courseIds = Object.values(courseResult.insertedIds);
    console.log(`  ✓ Inserted ${courseIds.length} courses`);

    // Generate Students
    console.log('👨‍🎓 Generating Students...');
    const studentDocs = [];
    for (let i = 0; i < 40; i++) {
      const studentId = `230217${String(i + 1).padStart(2, '0')}`;
      const enrolledCourses = courseIds.slice(0, Math.floor(Math.random() * 3) + 1);
      const notifications = [];
      for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
        notifications.push({
          title: randomElement(notificationTitles),
          text: randomElement(notificationTexts),
          date: randomDate(),
          read: Math.random() > 0.5
        });
      }
      studentDocs.push({
        studentId,
        name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        class: randomElement(classes),
        email: `${studentId}@vnu.edu.vn`,
        birthDate: randomDate(new Date(2002, 0, 1), new Date(2006, 0, 1)),
        account: {
          username: studentId,
          password: 'hashed_password_here',
          role: 'Student',
          lastLogin: randomDate()
        },
        eligibleForExam: Math.random() > 0.5,
        notifications,
        registeredExams: [],
        courses: enrolledCourses.map((cid, idx) => ({
          courseId: courseDocs[idx].courseId,
          courseName: courseDocs[idx].courseName,
          enrolledDate: randomDate()
        }))
      });
    }
    const studentResult = await db.collection('students').insertMany(studentDocs);
    const studentIds = Object.values(studentResult.insertedIds);
    console.log(`  ✓ Inserted ${studentIds.length} students`);

    // Generate Exams with Sessions
    console.log('📋 Generating Exams with Sessions...');
    const examDocs = [];
    for (let i = 0; i < 3; i++) {
      const startDate = randomDate(new Date(2024, 10, 1), new Date(2024, 11, 1));
      const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      const numSessions = Math.floor(Math.random() * 3) + 1;
      const sessions = [];

      for (let s = 0; s < numSessions; s++) {
        const sessionDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const registeredCount = Math.floor(Math.random() * 30) + 5;
        const registeredStudents = [];
        for (let r = 0; r < registeredCount; r++) {
          const randomSid = randomElement(studentIds);
          const randomStudent = studentDocs.find(s => s._id === randomSid) || studentDocs[0];
          registeredStudents.push({
            studentId: randomSid,
            studentName: randomStudent.name,
            registerTime: randomDate()
          });
        }

        sessions.push({
          examDate: sessionDate,
          startTime: new Date(sessionDate.getTime() + 8 * 60 * 60 * 1000),
          endTime: new Date(sessionDate.getTime() + 10 * 60 * 60 * 1000),
          course: randomElement(courses), 
          roomId: randomElement(examRoomIds), // reference to exam room
          registeredStudents
        });
      }

      examDocs.push({
        examId: `EXAM202${4 + i}`,
        examName: `${randomElement(['HK1', 'HK2', 'CK'])} Finals ${2024 + i}`,
        startDate,
        endDate,
        sessions
      });
    }
    const examResult = await db.collection('exams').insertMany(examDocs);
    console.log(`  ✓ Inserted ${Object.values(examResult.insertedIds).length} exams`);

    // Generate Notifications
    console.log('🔔 Generating Notifications...');
    const notificationDocs = [];
    for (let i = 0; i < 5; i++) {
      const randomStudentCount = Math.floor(Math.random() * 10) + 5;
      const recipients = [];
      for (let j = 0; j < randomStudentCount; j++) {
        const randomStudent = randomElement(studentDocs);
        recipients.push({
          studentId: randomStudent._id,
          studentName: randomStudent.name,
          read: Math.random() > 0.5,
          readDate: Math.random() > 0.5 ? randomDate() : null
        });
      }

      notificationDocs.push({
        title: randomElement(notificationTitles),
        text: randomElement(notificationTexts),
        date: randomDate(),
        sender: {
          staffId: randomElement(staffIds),
          staffName: randomElement(staffDocs).name
        },
        recipients,
        target: randomElement(['all', 'class', 'specific'])
      });
    }
    const notificationResult = await db.collection('notifications').insertMany(notificationDocs);
    console.log(`  ✓ Inserted ${Object.values(notificationResult.insertedIds).length} notifications`);

    // Summary
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Exam Rooms: ${examRoomIds.length}`);
    console.log(`   - staffs: ${staffIds.length}`);
    console.log(`   - Students: ${studentIds.length}`);
    console.log(`   - Courses: ${courseIds.length}`);
    console.log(`   - Exams: ${Object.values(examResult.insertedIds).length}`);
    console.log(`   - Notifications: ${Object.values(notificationResult.insertedIds).length}`);
    console.log('\n🔗 Open MongoDB Compass and check the "UniversityDB" database to view the data!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  }
}

seed();