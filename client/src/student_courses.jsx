import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";
// Thêm import Modal từ bootstrap (nếu bạn dùng thư viện bootstrap js truyền thống thì dùng qua thuộc tính data-bs)
// Ở đây tôi hướng dẫn cách dùng state để quản lý Modal thủ công cho linh hoạt

const CourseListPage = ({ onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal chi tiết
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/student-courses/all");
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Hàm xử lý khi nhấn "Xem chi tiết"
  const handleShowDetails = async (courseId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student-courses/details/${courseId}`);
      setSelectedCourse(response.data);
      setShowModal(true);
    } catch (error) {
      alert("Không thể tải chi tiết môn học");
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar onLogout={onLogout} />

      <main className="flex-grow-1 p-4 overflow-auto">
        <HeaderStudent title="Danh sách môn học phải thi" subTitle="Tất cả học phần" notificationCount={3} />

        <div className="row g-4">
          {courses.map((course) => (
            <div className="col-md-6 col-lg-4" key={course.courseId}>
              <div className="card h-100 border-0 shadow-sm rounded-3 border-top border-primary border-4">
                <div className="card-body">
                  <span className="badge bg-primary bg-opacity-10 text-primary mb-2">{course.courseId}</span>
                  <h5 className="fw-bold text-dark">{course.courseName}</h5>
                  <p className="text-muted small mb-0">Giảng viên: {course.professor}</p>
                </div>
                <div className="card-footer bg-white border-0 pb-3">
                  <button 
                    className="btn btn-outline-primary btn-sm w-100" 
                    onClick={() => handleShowDetails(course.courseId)}
                  >
                    Xem chi tiết học phần
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- MODAL CHI TIẾT MÔN HỌC --- */}
        {showModal && selectedCourse && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">Chi tiết học phần: {selectedCourse.courseId}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Tên môn học:</strong> {selectedCourse.courseName}</p>
                      <p className="mb-1"><strong>Số tín chỉ:</strong> {selectedCourse.credits}</p>
                      <p className="mb-1"><strong>Giảng viên:</strong> {selectedCourse.professor}</p>
                    </div>
                    <div className="col-md-6 bg-light p-3 rounded-3">
                      <h6 className="fw-bold mb-2 text-primary"><i className="bi bi-calendar-event me-2"></i>Lịch trình</h6>
                      <p className="small mb-1"><strong>Ngày:</strong> {selectedCourse.schedule?.days?.join(", ")}</p>
                      <p className="small mb-1"><strong>Thời gian:</strong> {selectedCourse.schedule?.time}</p>
                      <p className="small mb-0"><strong>Địa điểm:</strong> {selectedCourse.schedule?.location}</p>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3 border-bottom pb-2">
                    Danh sách sinh viên ({selectedCourse.enrolledStudents?.length || 0})
                  </h6>
                  <div className="table-responsive" style={{ maxHeight: '300px' }}>
                    <table className="table table-sm table-hover align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>STT</th>
                          <th>Mã sinh viên</th>
                          <th>Tên sinh viên</th>
                          <th>Ngày tham gia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCourse.enrolledStudents?.length > 0 ? (
                          selectedCourse.enrolledStudents.map((st, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td className="fw-semibold text-primary">{st.studentId}</td>
                              <td>{st.studentName || "N/A"}</td>
                              <td className="small text-muted">
                                {new Date(st.enrollmentDate).toLocaleDateString('vi-VN')}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" className="text-center py-3 text-muted">Chưa có sinh viên tham gia lớp này.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseListPage;