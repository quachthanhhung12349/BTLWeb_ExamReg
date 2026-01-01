import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";
import autoTable from "jspdf-autotable";
import { robotoBase64 } from "./fonts/Roboto-Regular-Base64.js";

import { getApiBase } from "./api/base";

const CourseListPage = ({ onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const pdfExportRef = useRef(null);

  const examRegUrl = async (suffix = "") => {
    return `${await getApiBase()}/api/exam-registrations${suffix}`;
  };

  useEffect(() => {
    const fetchGridData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(await examRegUrl('/all-courses'));
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchGridData();
  }, []);

  const handleShowDetails = async (courseId) => {
    try {
      const response = await axios.get(await examRegUrl(`/details/${courseId}`));
      setSelectedCourse(response.data);
      setShowModal(true);
    } catch (error) {
      alert("Lỗi tải chi tiết");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await axios.get(await examRegUrl('/subjects'));
      const data = res.data;

      const doc = new jsPDF("l", "mm", "a4");

      // 1. NHÚNG FONT VÀ SET LÀM MẶC ĐỊNH NGAY LẬP TỨC
      doc.addFileToVFS("Roboto-Regular.ttf", robotoBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.addFont("Roboto-Regular.ttf", "Roboto", "bold"); // Có thể dùng cùng 1 file font nếu bạn không có file Bold riêng
      doc.setFont("Roboto", "normal"); // Quan trọng: Set font mặc định cho toàn bộ doc

      const pageWidth = doc.internal.pageSize.getWidth();

      // 2. PHẦN TIÊU ĐỀ (Chỉ xuất hiện ở trang 1)
      doc.setFontSize(11);
      doc.text("ĐẠI HỌC QUỐC GIA HÀ NỘI", 45, 15, { align: "center" });
      doc.text("TRƯỜNG ĐẠI HỌC CÔNG NGHỆ", 45, 21, { align: "center" });

      doc.text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", pageWidth - 70, 15, { align: "center" });
      doc.setFontSize(10);
      doc.text("Độc lập - Tự do - Hạnh phúc", pageWidth - 70, 21, { align: "center" });
      doc.text("-----------------------", pageWidth - 70, 24, { align: "center" });

      doc.setFontSize(20);
      doc.text("DANH SÁCH MÔN PHẢI THI", pageWidth / 2, 38, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Ngày tải: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, 45, { align: "center" });

      // 3. VẼ BẢNG
      autoTable(doc, {
        startY: 52,
        head: [['STT', 'Mã môn', 'Tên môn học', 'STC', 'Giảng viên', 'Sĩ số', 'Giờ thi', 'Ngày thi', 'Phòng thi']],
        body: data.map((item, idx) => [
          idx + 1,
          item.courseId,
          item.courseName,
          item.credits,
          item.professor,
          item.studentCount,
          item.examTime,
          item.examDate,
          item.room
        ]),

        showHead: 'firstPage', 
        styles: {
          font: "Roboto", 
          fontSize: 9,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 255, 255], 
          textColor: [0, 0, 0],       
          fontStyle: "normal",
          halign: 'center',
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 25 },
          3: { halign: 'center', cellWidth: 12 },
          5: { halign: 'center', cellWidth: 15 },
        },
        theme: 'grid',
      });

      doc.save("Danh_sach_mon_phai_thi.pdf");

    } catch (error) {
      console.error(error);
      alert("Lỗi xuất PDF");
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar onLogout={onLogout} />

      <main className="flex-grow-1 p-4 d-flex flex-column overflow-hidden">
        <HeaderStudent title="Danh sách môn học phải thi" subTitle="Tất cả học phần" />

        <div className="flex-grow-1 overflow-auto mt-3">
          <div className="row g-4">
            {courses.map((c) => (
              <div className="col-md-6 col-lg-4" key={c.courseId}>
                <div className="card h-100 border-0 shadow-sm border-top border-primary border-4">
                  <div className="card-body">
                    <span className="badge bg-primary bg-opacity-10 text-primary mb-2">{c.courseId}</span>
                    <h5 className="fw-bold">{c.courseName}</h5>
                    <p className="text-muted small">Giảng viên: {c.professor}</p>
                  </div>
                  <div className="card-footer bg-white border-0 pb-3">
                    <button className="btn btn-outline-primary btn-sm w-100" onClick={() => handleShowDetails(c.courseId)}>
                      Xem chi tiết học phần
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
          <button className="btn btn-primary px-4 shadow-sm" onClick={handleDownloadPDF}>
            <i className="bi bi-file-pdf me-2"></i> Xuất PDF & Tải về
          </button>
        </div>

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
                      <p className="mb-1"><strong>Số tín chỉ:</strong> {selectedCourse.credits || 4}</p>
                      <p className="mb-1"><strong>Giảng viên:</strong> {selectedCourse.professor}</p>
                    </div>
                    <div className="col-md-6 bg-light p-3 rounded-3">
                      <h6 className="fw-bold mb-2 text-primary">Lịch trình</h6>
                      <p className="small mb-1"><strong>Ngày:</strong> {selectedCourse.schedule?.days?.join(", ")}</p>
                      <p className="small mb-1"><strong>Thời gian:</strong> {selectedCourse.schedule?.time}</p>
                      <p className="small mb-0"><strong>Địa điểm:</strong> {selectedCourse.schedule?.location}</p>
                    </div>
                  </div>
                  <h6 className="fw-bold mb-3 border-bottom pb-2">Danh sách sinh viên ({selectedCourse.enrolledStudents?.length || 0})</h6>
                  <div className="table-responsive" style={{ maxHeight: '300px' }}>
                    <table className="table table-sm table-hover align-middle">
                      <thead className="table-light sticky-top">
                        <tr><th>STT</th><th>Mã sinh viên</th><th>Tên sinh viên</th><th>Ngày tham gia</th></tr>
                      </thead>
                      <tbody>
                        {selectedCourse.enrolledStudents?.map((st, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td className="fw-semibold text-primary">{st.studentId || "N/A"}</td>
                            <td>{st.studentName}</td>
                            <td className="text-muted small">{new Date(st.enrollmentDate).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
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

        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div ref={pdfExportRef} style={{ width: "1100px", padding: "40px", background: "#fff", color: "#000", display: "none" }}>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px" }}>ĐẠI HỌC QUỐC GIA HÀ NỘI</div>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style={{ fontSize: "14px" }}>Độc lập - Tự do - Hạnh phúc</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontWeight: "bold", fontSize: "26px", margin: "0" }}>DANH SÁCH MÔN PHẢI THI</h2>
              <p style={{ fontSize: "16px", marginTop: "10px" }}>Ngày tải: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
              <thead>
                <tr>
                  <th style={headerStyle}>STT</th>
                  <th style={headerStyle}>Mã môn</th>
                  <th style={headerStyle}>Tên môn học</th>
                  <th style={headerStyle}>STC</th>
                  <th style={headerStyle}>Giảng viên</th>
                  <th style={headerStyle}>Sĩ số</th>
                  <th style={headerStyle}>Giờ thi</th>
                  <th style={headerStyle}>Ngày thi</th>
                  <th style={headerStyle}>Phòng thi</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, idx) => (
                  <tr key={idx} style={{ textAlign: "center", fontSize: "14px" }}>
                    <td style={tStyle}>{idx + 1}</td>
                    <td style={tStyle}>{item.courseId}</td>
                    <td style={{ ...tStyle, textAlign: "left" }}>{item.courseName}</td> {/* Tên môn sạch mã môn */}
                    <td style={tStyle}>{item.credits}</td>
                    <td style={tStyle}>{item.professor}</td>
                    <td style={tStyle}>{item.studentCount}</td>
                    <td style={tStyle}>{item.examTime}</td>
                    <td style={tStyle}>{item.examDate}</td>
                    <td style={tStyle}>{item.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const tStyle = { border: "1px solid #000", padding: "10px" };

const headerStyle = {
  ...tStyle,
  textAlign: "center",
  fontWeight: "bold",
  background: "#fff"
};

export default CourseListPage;