require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const firstNames = ['Lý', 'Trần', 'Nguyễn', 'Hoàng', 'Võ', 'Phan', 'Đặng', 'Bùi', 'Đinh', 'Phạm'];
const lastNames = ['Đức Tú', 'Văn A', 'Thị B', 'Minh C', 'Hùng D', 'Linh E', 'Phương F', 'Quyền G', 'Thanh H', 'Kiên I'];
const classes = ['K68I-CS1', 'K68I-CS2', 'K68I-CS3', 'K68I-SE1', 'K68I-IT1'];
const campuses = ['Giảng đường Xuân Thuỷ', 'Giảng đường Tôn Thất Thuyết', 'Giảng đường Kiều Mai'];
const rooms = ['A101', 'A102', 'A103', 'B201', 'B202', 'C301', 'C302'];
const courses = ['INT2204 - Lập trình Web', 'INT2205 - Cơ sở dữ liệu', 'INT2206 - Hệ điều hành', 'INT2207 - Mạng máy tính', 'INT2208 - Lập trình C++'];
const permissions = ['view_students', 'add_students', 'edit_students', 'delete_students', 'manage_exams', 'send_notifications'];
const notificationTitles = ['Thông báo lịch thi', 'Cập nhật điểm', 'Thông báo đặc biệt', 'Nhắc nhở nộp bài', 'Kết quả tuyển sinh'];
const notificationTexts = [
  'Kỳ thi sắp tới vào ngày hôm sau', 'Điểm của bạn đã được cập nhật', 'Hãy kiểm tra thông tin cá nhân', 'Hạn chót nộp bài là ngày mai', 'Bạn đã được chấp thuận'
];

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

async function seed() {
  console.log(process.env.MONGO_URI)
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    const db = mongoose.connection.db;

    // Clear existing data
    console.log('🗑️  Clearing existing collections...');
    await db.collection('students').deleteMany({});
    await db.collection('staffs').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('exam_rooms').deleteMany({});
    await db.collection('exams').deleteMany({});
    await db.collection('notifications').deleteMany({});

    // 1. Generate Exam Rooms
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

    // 2. Generate staffs
    console.log('👥 Generating staffs...');
    const staffDocs = [];
    for (let i = 0; i < 3; i++) {
      staffDocs.push({
        name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        email: `staffs${i}@vnu.edu.vn`,
        account: {
          username: `staffs${i}`, password: 'hashed_password_here', role: 'staffs',
          permissions: permissions.slice(0, Math.floor(Math.random() * 3) + 1)
        },
        sentNotifications: []
      });
    }
    const staffResult = await db.collection('staffs').insertMany(staffDocs);
    const staffIds = Object.values(staffResult.insertedIds);

    // 3. Generate Courses
    console.log('📚 Generating Courses...');
    const courseDocs = [];
    for (let i = 0; i < 5; i++) {
      const fullCourseName = courses[i];
      courseDocs.push({
        courseId: fullCourseName.split(' - ')[0], 
        courseName: fullCourseName,
        credits: 2 + Math.floor(Math.random() * 4),
        professor: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        currentEnrollment: 0,
        enrolledStudents: [],
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: "08:00 - 10:00",
          location: `${randomElement(rooms)} - ${randomElement(campuses)}`
        }
      });
    }
    const courseResult = await db.collection('courses').insertMany(courseDocs);
    const courseIds = Object.values(courseResult.insertedIds);

    // 4. Generate Students
    console.log('👨‍🎓 Generating Students...');
    const studentDocs = [];
    for (let i = 0; i < 40; i++) {
      const studentId = `230217${String(i + 1).padStart(2, '0')}`;
      const name = `${randomElement(firstNames)} ${randomElement(lastNames)}`;
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
        name,
        class: randomElement(classes),
        email: `${studentId}@vnu.edu.vn`,
        birthDate: randomDate(new Date(2002, 0, 1), new Date(2006, 0, 1)),
        account: { username: studentId, password: 'hashed_password_here', role: 'Student', lastLogin: randomDate() },
        notifications,
        registeredExams: [],
        courses: enrolledCourses.map((cid, idx) => ({
          courseId: courseDocs[idx].courseId,
          courseName: courseDocs[idx].courseName,
          enrolledDate: randomDate()
        }))
      });

      // Thêm SV vào bảng Course 
      for (const cidIdx of enrolledCourses.map((id, idx) => idx)) {
        await db.collection('courses').updateOne(
          { _id: courseIds[cidIdx] },
          {
            $inc: { currentEnrollment: 1 },
            $push: { enrolledStudents: { studentId, studentName: name, enrollmentDate: new Date() } }
          }
        );
      }
    }
    const studentResult = await db.collection('students').insertMany(studentDocs);
    const studentIds = Object.values(studentResult.insertedIds);

    // 5. Generate Exams with Sessions
    console.log('📋 Generating Exams with Random Sessions...');
    const examDocs = [];

    for (let i = 0; i < 3; i++) {
      const startDate = randomDate(new Date(2024, 10, 15), new Date(2024, 11, 15));
      const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  
      const sessions = [];

      // Lặp qua TẤT CẢ môn học để đảm bảo môn nào cũng có lịch
      for (let s = 0; s < courseDocs.length; s++) {
        const sessionDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const startHour = 7 + Math.floor(Math.random() * 9); 
        
        sessions.push({
          _id: new mongoose.Types.ObjectId(),
          examDate: sessionDate,
          startTime: new Date(new Date(sessionDate).setHours(startHour, 0, 0, 0)),
          endTime: new Date(new Date(sessionDate).setHours(startHour + 2, 0, 0, 0)),
          course: `${courseDocs[s].courseId} - ${courseDocs[s].courseName}`, 
          roomId: randomElement(examRoomIds), 
          registeredStudents: [] 
        });
      }

      examDocs.push({
        examId: `EXAM2024_${i}_${Math.floor(Math.random() * 1000)}`,
        examName: `${['HK1', 'HK2', 'CK'][i]} Finals 2024`,
        startDate,
        endDate,
        sessions
      });
    }
    const examResult = await db.collection('exams').insertMany(examDocs);
    console.log(`  ✓ Inserted ${Object.values(examResult.insertedIds).length} exams with random dates`);

    // Cập nhật registeredExams cho sinh viên từ dữ liệu ngẫu nhiên vừa tạo
    for (const exam of examDocs) {
      for (const session of exam.sessions) {
        for (const regSt of session.registeredStudents) {
          await db.collection('students').updateOne(
            { _id: regSt.studentId },
            {
              $push: {
                registeredExams: {
                  examId: exam._id,
                  examName: exam.examName,
                  sessionId: session._id,
                  courseId: session.course.split(' - ')[0],
                  registerTime: regSt.registerTime
                }
              }
            }
          );
        }
      }
    }

    // 6. Generate Notifications
    console.log('🔔 Generating Notifications...');
    const notificationDocs = [];
    for (let i = 0; i < 5; i++) {
      const recipients = [];
      for (let j = 0; j < 5; j++) {
        const randomStudent = randomElement(studentDocs);
        recipients.push({
          studentId: randomStudent._id, studentName: randomStudent.name,
          read: Math.random() > 0.5, readDate: randomDate()
        });
      }
      notificationDocs.push({
        title: randomElement(notificationTitles),
        text: randomElement(notificationTexts),
        date: randomDate(),
        sender: { staffId: staffIds[0], staffName: "Admin" },
        recipients, target: 'all'
      });
    }
    const notificationResult =
      await db.collection('notifications').insertMany(notificationDocs);

    console.log('\n📊 Summary:');
    console.log(`   - Exam Rooms: ${examRoomIds.length}`);
    console.log(`   - staffs: ${staffIds.length}`);
    console.log(`   - Students: ${studentIds.length}`);
    console.log(`   - Courses: ${courseIds.length}`);
    console.log(`   - Exams: ${Object.values(examResult.insertedIds).length}`);
    console.log(`   - Notifications: ${Object.values(notificationResult.insertedIds).length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();