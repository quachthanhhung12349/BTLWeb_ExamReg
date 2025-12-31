import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./sidebar_student.jsx";
import HeaderStudent from "./student_header.jsx";
import { getApiBase } from "./api/base";

const RegistrationPage = ({ onLogout }) => {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const studentId = localStorage.getItem("studentId");

  const examRegUrl = async (suffix = "") => {
    return `${await getApiBase()}/api/exam-registrations${suffix}`;
  };

  const fetchSubjects = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const response = await axios.get(await examRegUrl(`/status/${studentId}`));
      setSubjects(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [studentId]);

  const handleRegister = async (courseId, sessionId) => {
    try {
      const response = await axios.post(await examRegUrl(), {
        studentId, courseId, sessionId, action: 'register'
      });
      if (response.data.success) {
        alert("Đăng ký ca thi thành công!");
        fetchSubjects();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const handleUnregister = async (courseId, sessionId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đăng ký ca thi này?")) {
      try {
        const response = await axios.post(await examRegUrl(), {
          studentId, courseId, sessionId, action: 'unregister'
        });
        if (response.data.success) {
          alert("Đã hủy đăng ký thành công");
          fetchSubjects();
        }
      } catch (error) {
        alert(error.response?.data?.message || "Hủy đăng ký thất bại");
      }
    }
  };

  const processedItems = subjects
    .filter(s => {
      const searchStr = search.toLowerCase();
      return (s.courseId || "").toLowerCase().includes(searchStr) ||
        (s.name || "").toLowerCase().includes(searchStr);
    })
    .sort((a, b) => {
      // Hàm xác định độ ưu tiên
      const getPriority = (item) => {
        if (item.registered) return 1;
        if (!item.disabled) return 2;
        return 3;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.courseId.localeCompare(b.courseId);
    });

  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedItems.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar onLogout={onLogout} />
      
      <main className="flex-grow-1 p-3 p-md-4 overflow-auto">
        <HeaderStudent title="Đăng ký ca thi" subTitle="Học kỳ 1 năm học 2023-2024" />

        <div className="bg-white p-3 rounded-3 shadow-sm mb-4 border">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none"
              placeholder="Tìm kiếm theo mã học phần hoặc tên môn học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4 rounded-3 overflow-hidden">
          <div className="card-body p-0" style={{ minHeight: '560px', display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
            
            <table className="table table-hover mb-0 align-middle" style={{ width: '100%', minWidth: '1100px', tableLayout: 'fixed' }}>
              <thead className="bg-light">
                <tr style={{ height: '55px' }}>
                  <th style={{ width: '5%' , paddingLeft: '20px' }} className="text-secondary small fw-bold">STT</th>
                  <th style={{ width: '10%' }} className="text-secondary small fw-bold">MÃ MÔN</th>
                  <th style={{ width: '22%' }} className="text-secondary small fw-bold">TÊN MÔN</th>
                  <th style={{ width: '7%' }} className="text-secondary small fw-bold text-center">TÍN CHỈ</th>
                  <th style={{ width: '10%' }} className="text-secondary small fw-bold">NGÀY THI</th>
                  <th style={{ width: '8%' }} className="text-secondary small fw-bold">GIỜ THI</th>
                  <th style={{ width: '10%' }} className="text-secondary small fw-bold">PHÒNG</th>
                  <th style={{ width: '8%' }} className="text-secondary small fw-bold text-center">SỐ LƯỢNG</th>
                  <th style={{ width: '11%' }} className="text-secondary small fw-bold">TRẠNG THÁI</th>
                  <th style={{ width: '9%' , paddingRight: '20px' }} className="text-secondary small fw-bold text-end">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((s, index) => (
                  <tr key={s.sessionId} style={{ height: '58px', borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ paddingLeft: '20px' }} className="fw-bold text-muted">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="fw-bold text-dark">{s.courseId}</td>
                    
                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.name}>
                      {s.name}
                    </td>

                    <td className="text-center text-muted">{s.credits}</td>
                    <td className="text-muted">{new Date(s.examDate).toLocaleDateString('vi-VN')}</td>
                    <td className="text-muted">{new Date(s.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="text-muted">{s.room}</td>
                    <td className="text-center text-muted">{s.registeredCount}/{s.maxStudents}</td>
                    <td>
                      {s.registered ? (
                        <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '5px', backgroundColor: '#eefaf3', color: '#28a745', border: '1px solid #d4edda', display: 'inline-block' }}>Đã đăng ký</span>
                      ) : (
                        <span className="text-muted small fst-italic">Chưa đăng ký</span>
                      )}
                    </td>
                    <td style={{ paddingRight: '20px' }} className="text-end">
                      {!s.registered ? (
                        <button
                          onClick={() => handleRegister(s.courseId, s.sessionId)}
                          disabled={s.disabled}
                          className="btn fw-bold p-0"
                          style={{ 
                            backgroundColor: s.disabled ? '#e9ecef' : '#2563eb', 
                            color: s.disabled ? '#adb5bd' : '#fff',
                            fontSize: '12px', height: '32px', borderRadius: '5px', border: 'none', width: '100%', maxWidth: '85px'
                          }}
                        >
                          Đăng ký
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnregister(s.courseId, s.sessionId)}
                          className="btn fw-bold p-0"
                          style={{ 
                            backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545',
                            fontSize: '12px', height: '32px', borderRadius: '5px', width: '100%', maxWidth: '85px'
                          }}
                        >
                          Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ flexGrow: 1 }}></div>
          </div>

          <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
            <span className="text-muted small">Hiển thị {currentItems.length} ca thi</span>
            <div className="d-flex gap-2">
              <button className="btn btn-sm border bg-white px-3" onClick={() => setCurrentPage(v => Math.max(v - 1, 1))} disabled={currentPage === 1}>Trước</button>
              <button className="btn btn-sm border bg-white px-3" onClick={() => setCurrentPage(v => Math.min(v + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Sau</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;