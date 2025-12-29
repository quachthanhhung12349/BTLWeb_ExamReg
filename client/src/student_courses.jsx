import React from "react";
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";

const CourseListPage = ({ onLogout }) => {
  // Mock data mô phỏng từ Student.courses schema
  const myCourses = [
    { courseId: "INT3306", courseName: "Phát triển ứng dụng Web", professor: "PGS.TS Nguyễn Văn B" },
    { courseId: "INT3405E", courseName: "Học máy", professor: "TS. Trần Thị C" },
    { courseId: "PHI1006", courseName: "Triết học Mác – Lênin", professor: "TS. Lê Văn D" },
    { courseId: "INT2212", courseName: "Kiến trúc máy tính", professor: "TS. Nguyễn Văn E" },
    { courseId: "PHI1002", courseName: "Chủ nghĩa xã hội khoa học", professor: "ThS. Phạm Thị F" },
  ];

  return (
    <div className="d-flex vh-100 bg-light">
      {/* 1. Sidebar bên trái */}
      <Sidebar onLogout={onLogout} />

      {/* 2. Nội dung bên phải */}
      <main className="flex-grow-1 p-4 overflow-auto">
        <HeaderStudent
          title="Danh sách môn học phải thi"
          subTitle="Các học phần trong chương trình đào tạo"
          notificationCount={3}
        />

        <div className="row g-4">
          {myCourses.map((course) => (
            <div className="col-md-6 col-lg-4" key={course.courseId}>
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden border-top border-primary border-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">
                      {course.courseId}
                    </span>
                    <i className="bi bi-journal-text text-muted"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-2 text-dark" style={{ fontSize: '1.1rem' }}>
                    {course.courseName}
                  </h5>
                  <p className="card-text text-muted small mb-0">
                    <i className="bi bi-person me-2"></i>
                    Giảng viên: {course.professor}
                  </p>
                </div>
                <div className="card-footer bg-white border-top-0 pb-3 pt-0">
                  <button className="btn btn-outline-primary btn-sm w-100 fw-semibold">
                    Xem chi tiết học phần
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseListPage;