import React, { useState } from "react";
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";

const ExamSlipPage = ({ onLogout }) => {
  const [selectedExam, setSelectedExam] = useState(null);

  // Mock data mô phỏng từ Student.registeredExams
  const registeredExams = [
    { id: "e1", examName: "Phát triển ứng dụng Web", code: "INT3306", date: "20/12/2023", time: "08:00 - 10:00", room: "302-G2", seat: "25" },
    { id: "e2", examName: "Học máy", code: "INT3405E", date: "22/12/2023", time: "14:00 - 16:00", room: "105-G3", seat: "12" },
    { id: "e3", examName: "Triết học Mác – Lênin", code: "PHI1006", date: "25/12/2023", time: "07:30 - 09:30", room: "201-G2", seat: "45" },
  ];

  return (
    <div className="d-flex vh-100 bg-light">
      {/* 1. Sidebar bên trái */}
      <Sidebar onLogout={onLogout} />

      {/* 2. Nội dung bên phải */}
      <main className="flex-grow-1 p-4 overflow-auto">
        <HeaderStudent
          title="Phiếu báo dự thi"
          subTitle="Thông tin chi tiết thời gian và địa điểm thi"
          notificationCount={3}
        />

        <div className="row h-100">
          {/* Cột chọn môn học (Ẩn khi in) */}
          <div className="col-md-4 mb-4 d-print-none">
            <div className="card shadow-sm border-0 rounded-3 h-100">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <h6 className="fw-bold text-uppercase text-secondary small" style={{ letterSpacing: '0.5px' }}>
                  Danh sách môn đã đăng ký
                </h6>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush gap-2">
                  {registeredExams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => setSelectedExam(exam)}
                      className={`list-group-item list-group-item-action border rounded-3 py-3 transition-all ${selectedExam?.id === exam.id
                        ? "bg-primary bg-opacity-10 border-primary text-primary fw-bold"
                        : "border-light"
                        }`}
                    >
                      <div className="d-flex align-items-center">
                        <i className={`bi ${selectedExam?.id === exam.id ? 'bi-file-earmark-check-fill' : 'bi-file-earmark-text'} me-3 fs-5`}></i>
                        <div>
                          <div className="small opacity-75">{exam.code}</div>
                          <div>{exam.examName}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cột hiển thị phiếu chi tiết */}
          <div className="col-md-8">
            {selectedExam ? (
              <div className="card shadow border-0 p-5 rounded-4 bg-white position-relative overflow-hidden">
                {/* Đường kẻ trang trí phía trên */}
                <div className="position-absolute top-0 start-0 w-100" style={{ height: '6px', backgroundColor: '#4f46e5' }}></div>

                <div className="text-center mb-5">
                  <h3 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Phiếu báo dự thi</h3>
                  <p className="text-muted">Học kỳ 1 năm học 2023-2024</p>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-6">
                    <label className="text-muted small text-uppercase fw-bold">Họ và tên</label>
                    <p className="fs-5 fw-bold mb-0">Nguyễn Văn A</p>
                  </div>
                  <div className="col-6 text-end">
                    <label className="text-muted small text-uppercase fw-bold">Mã sinh viên</label>
                    <p className="fs-5 mb-0">21001234</p>
                  </div>

                  <div className="col-12 my-2">
                    <hr className="opacity-10" />
                  </div>

                  <div className="col-12">
                    <label className="text-muted small text-uppercase fw-bold d-block mb-1">Môn thi</label>
                    <p className="fs-4 fw-bold text-primary mb-0">{selectedExam.examName} ({selectedExam.code})</p>
                  </div>

                  <div className="col-md-6 mt-4">
                    <div className="d-flex align-items-start mb-4">
                      <div className="bg-light p-2 rounded-3 me-3"><i className="bi bi-calendar3 text-primary"></i></div>
                      <div>
                        <label className="text-muted small fw-bold">Ngày thi</label>
                        <div className="fw-bold fs-5">{selectedExam.date}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-start">
                      <div className="bg-light p-2 rounded-3 me-3"><i className="bi bi-clock text-primary"></i></div>
                      <div>
                        <label className="text-muted small fw-bold">Giờ thi</label>
                        <div className="fw-bold fs-5">{selectedExam.time}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mt-4">
                    <div className="d-flex align-items-start mb-4">
                      <div className="bg-light p-2 rounded-3 me-3"><i className="bi bi-geo-alt text-primary"></i></div>
                      <div>
                        <label className="text-muted small fw-bold">Phòng thi</label>
                        <div className="fw-bold fs-5">{selectedExam.room}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-start border border-danger border-opacity-25 bg-danger bg-opacity-10 p-2 rounded-3">
                      <div className="p-2 rounded-3 me-3"><i className="bi bi-person-badge text-danger fs-4"></i></div>
                      <div>
                        <label className="text-danger small fw-bold">Số báo danh</label>
                        <div className="fw-bold text-danger fs-4">{selectedExam.seat}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-top d-flex justify-content-end gap-3 d-print-none">
                  <button className="btn btn-outline-primary px-4 py-2 fw-bold" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i> In phiếu báo
                  </button>
                  <button className="btn btn-success px-4 py-2 fw-bold">
                    <i className="bi bi-download me-2"></i> Tải PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="bg-light rounded-circle p-4 mb-3">
                  <i className="bi bi-file-earmark-arrow-up fs-1 text-muted opacity-50"></i>
                </div>
                <h5 className="text-dark fw-bold">Chưa chọn môn học</h5>
                <p className="text-muted">Vui lòng chọn một môn thi ở danh sách bên trái để hiển thị phiếu báo dự thi chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamSlipPage;