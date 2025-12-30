import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";

const ExamSlipPage = ({ onLogout }) => {
  const [studentData, setStudentData] = useState(null);
  const [registeredExams, setRegisteredExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);

  const slipRef = useRef();

  const studentId = localStorage.getItem("studentId");
  const API_BASE_URL = "http://localhost:5000/api/exam-registrations";

  useEffect(() => {
    const fetchExamSlips = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/${studentId}/view-slips`);
        setStudentData(res.data.studentInfo);
        setRegisteredExams(res.data.registeredExams);
        if (res.data.registeredExams.length > 0) {
          setSelectedExam(res.data.registeredExams[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Lỗi tải phiếu báo:", err);
        setLoading(false);
      }
    };
    fetchExamSlips();
  }, [studentId]);

  const handleDownloadPDF = async (regId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/${regId}/download-info`);
      console.log("Xác nhận dữ liệu từ server:", res.data);

      const element = slipRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`PhieuBao_${studentId}_${selectedExam.code}.pdf`);
    } catch (err) {
      alert("Lỗi khi tải file PDF");
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <style>
        {`
          @media print {
            .d-print-none, .sidebar-wrapper, header, .btn-print-group {
              display: none !important;
            }
            .main-content { margin: 0 !important; padding: 0 !important; background-color: white !important; }
            .row { display: flex !important; flex-wrap: wrap !important; }
            .col-md-8 { width: 100% !important; max-width: 100% !important; flex: 0 0 100% !important; margin: 0 !important; padding: 0 !important; }
            .card.shadow { box-shadow: none !important; border: 1px solid #dee2e6 !important; border-radius: 0 !important; }
            .vh-100 { height: auto !important; }
            
            .info-container { display: flex !important; flex-direction: row !important; }
            .photo-side { width: 30% !important; }
            .text-side { width: 70% !important; }
            
            @page { margin: 1.5cm; }
          }
          
          .photo-frame {
            width: 100px;
            height: 130px;
            border: 1px dashed #adb5bd;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 0.75rem;
            text-align: center;
          }

          .info-row {
            display: flex;
            margin-bottom: 8px;
            align-items: baseline;
          }
          .info-label {
            width: 130px;
            flex-shrink: 0;
          }
        `}
      </style>

      <div className="d-print-none sidebar-wrapper">
        <Sidebar onLogout={onLogout} />
      </div>

      <main className="flex-grow-1 p-4 overflow-auto main-content">
        <div className="d-print-none">
          <HeaderStudent title="Phiếu báo dự thi" subTitle="Thông tin chi tiết" notificationCount={3} />
        </div>

        {loading ? (
          <div className="text-center p-5">Đang tải dữ liệu phiếu báo...</div>
        ) : (
          <div className="row h-100">
            <div className="col-md-4 mb-4 d-print-none">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-4 pb-0">
                  <h6 className="fw-bold text-uppercase text-secondary small">Danh sách môn đã đăng ký</h6>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush gap-2">
                    {registeredExams.map((exam) => (
                      <button
                        key={exam.regId}
                        onClick={() => setSelectedExam(exam)}
                        className={`list-group-item list-group-item-action border rounded-3 py-3 ${selectedExam?.regId === exam.regId ? "bg-primary bg-opacity-10 border-primary text-primary fw-bold" : "border-light"}`}
                      >
                        <div className="small opacity-75">{exam.code}</div>
                        <div>{exam.courseName}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              {selectedExam && studentData ? (
                <div ref={slipRef} className="card shadow border-0 p-5 rounded-4 bg-white position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '6px', backgroundColor: '#4f46e5' }}></div>

                  <div className="text-center mb-5">
                    <h3 className="fw-bold text-uppercase mb-1">Phiếu báo dự thi</h3>
                    <p className="text-muted">{selectedExam.examName}</p>
                  </div>

                  <div className="row mb-4 info-container align-items-center">
                    <div className="col-4 photo-side">
                      <div className="photo-frame">
                        <div>Ảnh thẻ<br />3 x 4</div>
                      </div>
                    </div>

                    <div className="col-8 text-side">
                      <div className="info-row">
                        <span className="text-muted small text-uppercase fw-bold info-label">Họ và tên:</span>
                        <span className="fs-5 fw-bold text-dark">{studentData.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="text-muted small text-uppercase fw-bold info-label">Mã sinh viên:</span>
                        <span className="fs-5 fw-bold text-dark">{studentData.studentId}</span>
                      </div>
                      <div className="info-row">
                        <span className="text-muted small text-uppercase fw-bold info-label">Ngày sinh:</span>
                        <span className="fw-bold text-dark">{studentData.birthDate}</span>
                      </div>
                      <div className="info-row">
                        <span className="text-muted small text-uppercase fw-bold info-label">Lớp học:</span>
                        <span className="fw-bold text-dark">{studentData.class}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 my-3"><hr className="opacity-10" /></div>

                  <div className="row g-4 mt-2">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-2 rounded-3 me-3">
                          <i className="bi bi-calendar3 text-primary"></i>
                        </div>
                        <div>
                          <label className="text-muted small fw-bold">Ngày thi</label>
                          <div className="fw-bold fs-5">{selectedExam.date}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-2 rounded-3 me-3">
                          <i className="bi bi-geo-alt text-primary"></i>
                        </div>
                        <div>
                          <label className="text-muted small fw-bold">Phòng thi</label>
                          <div className="fw-bold fs-5">
                            {selectedExam.room}
                            <span className="text-muted fw-normal ms-2 small">({selectedExam.campus})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mt-4">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-2 rounded-3 me-3">
                          <i className="bi bi-clock text-primary"></i>
                        </div>
                        <div>
                          <label className="text-muted small fw-bold">Giờ thi</label>
                          <div className="fw-bold fs-5">{selectedExam.time}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 mt-4">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-2 rounded-3 me-3">
                          <i className="bi bi-person-badge text-primary"></i>
                        </div>
                        <div>
                          <label className="text-muted small fw-bold">Số báo danh</label>
                          <div className="fw-bold fs-5">{selectedExam.seat}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-top d-flex justify-content-end gap-3 d-print-none btn-print-group">
                    <button className="btn btn-outline-primary px-4 py-2 fw-bold" onClick={() => window.print()}>
                      <i className="bi bi-printer me-2"></i> In phiếu báo
                    </button>
                    <button
                      className="btn btn-success px-4 py-2 fw-bold"
                      onClick={() => handleDownloadPDF(selectedExam.regId)}
                    >
                      Tải PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                  <h5 className="text-dark fw-bold">Chưa chọn môn học</h5>
                  <p className="text-muted">Vui lòng chọn môn ở danh sách bên trái.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExamSlipPage;