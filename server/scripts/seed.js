const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const firstNames = ['Lý', 'Trần', 'Nguyễn', 'Hoàng', 'Võ', 'Phan', 'Đặng', 'Bùi', 'Đinh', 'Phạm', 'Lê', 'Đỗ', 'Hồ', 'Ngô'];
const lastNames = ['Đức Tú', 'Văn A', 'Thị B', 'Minh C', 'Hùng D', 'Linh E', 'Phương F', 'Quyền G', 'Thanh H', 'Kiên I', 'Gia Bảo', 'Minh Anh'];
const classes = ['K68I-CS1', 'K68I-CS2', 'K68I-CS3', 'K68I-SE1', 'K68I-IT1'];
const campuses = ['Giảng đường Xuân Thuỷ', 'Giảng đường Tôn Thất Thuyết', 'Giảng đường Kiều Mai'];
const rooms = ['A101', 'A102', 'A103', 'B201', 'B202', 'C301', 'C302', 'D101', 'E202', 'G301', 'G302', 'H101'];

const courses = [
  'INT2204 - Lập trình Web', 'INT2205 - Cơ sở dữ liệu', 'INT2206 - Hệ điều hành', 
  'INT2207 - Mạng máy tính', 'INT2208 - Lập trình C++', 'INT3306 - Lập trình hướng đối tượng',
  'INT3401 - AI', 'MAT1101 - Giải tích 1', 'MAT1102 - Đại số', 'PHI1001 - Triết học',
  'INT3110 - Kỹ thuật đồ họa', 'INT3502 - An toàn thông tin', 'PES1501 - Thể dục 1',
  'ENG1001 - Tiếng Anh 1', 'MAT1103 - Xác suất thống kê', 'INT3202 - Kiểm thử và đảm bảo chất lượng phần mềm',
  'INT3405 - Khai phá dữ liệu', 'INT2215 - Lập trình nâng cao'
];

const permissions = ['view_students', 'add_students', 'edit_students', 'delete_students', 'manage_exams', 'send_notifications'];
const notificationTitles = ['Thông báo lịch thi', 'Cập nhật điểm', 'Thông báo đặc biệt', 'Nhắc nhở nộp bài', 'Kết quả tuyển sinh'];
const notificationTexts = ['Kỳ thi sắp tới vào ngày hôm sau', 'Điểm của bạn đã được cập nhật', 'Hãy kiểm tra thông tin cá nhân', 'Hạn chót nộp bài là ngày mai', 'Bạn đã được chấp thuận'];

function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomEmail() { return `user${Math.floor(Math.random() * 99999)}@vnu.edu.vn`; }
function randomDate(start = new Date(2024, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomPhone() { return '0' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'); }
function randomCCCD() { return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'); }

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    const db = mongoose.connection.db;

    await db.collection('students').deleteMany({});
    await db.collection('staffs').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('exam_rooms').deleteMany({});
    await db.collection('exams').deleteMany({});
    await db.collection('notifications').deleteMany({});

    // 1. Generate Exam Rooms
    console.log('🏫 Generating Exam Rooms...');
    const examRoomDocs = rooms.map(r => ({
      _id: new mongoose.Types.ObjectId(),
      roomId: r, campus: randomElement(campuses), room: `Phòng ${r}`,
      maxStudents: (6 + Math.floor(Math.random() * 4)) * 10,
    }));
    const examRoomResult = await db.collection('exam_rooms').insertMany(examRoomDocs);
    const examRoomIds = Object.values(examRoomResult.insertedIds);

    // 2. Generate staffs
    console.log('👥 Generating staffs...');
    const staffDocs = Array.from({ length: 12 }).map((_, i) => ({
      name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      email: `staffs${i}@vnu.edu.vn`,
      account: {
        username: `staffs${i}`, password: 'hashed_password_here', role: 'Staff',
        permissions: permissions.slice(0, Math.floor(Math.random() * 3) + 1)
      },
      sentNotifications: []
    }));
    const staffResult = await db.collection('staffs').insertMany(staffDocs);
    const staffIds = Object.values(staffResult.insertedIds);

    // 3. Generate Courses
    console.log('📚 Generating Courses...');
    const courseDocs = courses.map(c => ({
      _id: new mongoose.Types.ObjectId(),
      courseId: c.split(' - ')[0],
      courseName: c,
      credits: 2 + Math.floor(Math.random() * 3),
      professor: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      currentEnrollment: 0,
      enrolledStudents: [],
      schedule: { days: ['Monday', 'Wednesday'], time: "08:00 - 10:00", location: `${randomElement(rooms)} - ${randomElement(campuses)}` }
    }));

    // 4. Generate Students
    console.log('👨‍🎓 Generating 200 Students...');
    const studentDocs = [];
    for (let i = 0; i < 200; i++) {
      const studentObjectId = new mongoose.Types.ObjectId();
      const studentId = (23021700 + i + 1).toString();
      const name = `${randomElement(firstNames)} ${randomElement(lastNames)}`;
      
      const numCourses = 7 + Math.floor(Math.random() * 3);
      const shuffledIndices = [...Array(courseDocs.length).keys()].sort(() => 0.5 - Math.random());
      const selectedIndices = shuffledIndices.slice(0, numCourses);

      const notifications = Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map(() => ({
        title: randomElement(notificationTitles), text: randomElement(notificationTexts),
        date: randomDate(), read: Math.random() > 0.5
      }));

      studentDocs.push({
        _id: studentObjectId,
        studentId, name,
        class: classes[i % classes.length],
        email: `${studentId}@vnu.edu.vn`,
        birthDate: randomDate(new Date(2002, 0, 1), new Date(2006, 0, 1)),
        account: { username: studentId, password: 'hashed_password_here', role: 'Student', lastLogin: randomDate() },
        eligibleForExam: true,
        notifications,
        registeredExams: [],
        courses: selectedIndices.map(idx => {
          const c = courseDocs[idx];
          c.currentEnrollment += 1;
          c.enrolledStudents.push({
            studentId: studentObjectId,
            studentName: name,
            enrollmentDate: new Date()
          });
          return { courseId: c.courseId, courseName: c.courseName, enrolledDate: randomDate() };
        })
      });
    }
    const studentResult = await db.collection('students').insertMany(studentDocs);
    const studentIds = Object.values(studentResult.insertedIds);

    // INSERT COURSES SAU KHI ĐÃ CÓ DANH SÁCH SINH VIÊN
    const courseResult = await db.collection('courses').insertMany(courseDocs);
    const courseIds = Object.values(courseResult.insertedIds);

    // 5. Generate Exams
    console.log('📋 Generating Exams...');
    const examDocs = [];
    const startDate = new Date(2024, 11, 15);
    const endDate = new Date(2025, 0, 10);
    const sessions = [];

    for (const course of courseDocs) {
      const shiftCount = 2 + Math.floor(Math.random() * 2); 
      const roundedMax = Math.ceil(Math.ceil(course.currentEnrollment / shiftCount) / 10) * 10;

      for (let shift = 0; shift < shiftCount; shift++) {
        const sessionDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        let suitableRooms = examRoomDocs.filter(r => r.maxStudents >= roundedMax);
        if (suitableRooms.length === 0) suitableRooms = [...examRoomDocs].sort((a,b) => b.maxStudents - a.maxStudents);

        sessions.push({
          _id: new mongoose.Types.ObjectId(),
          examDate: sessionDate,
          startTime: new Date(new Date(sessionDate).setHours(shift === 0 ? 7 : (shift === 1 ? 13 : 16), 0, 0, 0)),
          endTime: new Date(new Date(sessionDate).setHours(shift === 0 ? 9 : (shift === 1 ? 15 : 18), 0, 0, 0)),
          course: course.courseName,
          roomId: randomElement(suitableRooms)._id,
          registeredStudents: []
        });
      }
    }

    examDocs.push({
      examId: `EXAM2024_HK1_FINAL`,
      examName: `Học kỳ 1 năm học 2023-2024`,
      startDate, endDate, sessions
    });

    const examResult = await db.collection('exams').insertMany(examDocs);
    console.log(`  ✓ Inserted exams with ${sessions.length} sessions.`);

    // 6. Generate Notifications
    const notificationDocs = Array.from({ length: 5 }).map(() => ({
        title: randomElement(notificationTitles), text: randomElement(notificationTexts),
        date: randomDate(), sender: { staffId: staffIds[0], staffName: "Admin" },
        recipients: Array.from({ length: 5 }).map(() => ({ studentId: randomElement(studentIds), read: Math.random() > 0.5 })),
        target: 'all'
    }));
    await db.collection('notifications').insertMany(notificationDocs);

    console.log('\n✅ Seeding Completed. Student list in modal is fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
seed();