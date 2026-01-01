import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse, enrollStudentsInCourse } from './api/course_api.jsx';
import { fetchStudents } from './api/student_api.jsx';
import { fetchExamRooms } from './api/exam_room_api.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseAdd = () => {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [professor, setProfessor] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [classroom, setClassroom] = useState('');
  const [examRooms, setExamRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectedStudentsDetails, setSelectedStudentsDetails] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const rooms = await fetchExamRooms();
        setExamRooms(Array.isArray(rooms) ? rooms : rooms.rooms || []);
      } catch (err) {
        console.error('Failed to fetch exam rooms:', err);
      }
    })();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!courseId || !courseName) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    
    // Validate courseId length (minimum 4 characters)
    if (courseId.length < 4) {
      setError('Mã học phần phải có ít nhất 4 ký tự (VD: INT1234).');
      return;
    }
    
    // Validate courseName length (minimum 5 characters)
    if (courseName.length < 5) {
      setError('Tên học phần phải có ít nhất 5 ký tự.');
      return;
    }
    
    setLoading(true);
    try {
      const scheduleTime = scheduleStartTime && scheduleEndTime 
        ? `${scheduleStartTime} - ${scheduleEndTime}`
        : '';
      
      const courseData = {
        courseId,
        courseName,
        credits: credits ? Number(credits) : 3,
        professor: professor || '',
        schedule: (scheduleTime || classroom) ? {
          time: scheduleTime,
          location: classroom
        } : null
      };
      
      const createdCourse = await createCourse(courseData);
      
      // Add students to both enrolledStudents array and CourseStudent table
      if (selectedStudents.size > 0) {
        await enrollStudentsInCourse(createdCourse._id, Array.from(selectedStudents));
      }
      
      navigate('/admin/course');
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm học phần.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/course');
  };

  const openStudentModal = async () => {
    setLoadingStudents(true);
    try {
      const students = await fetchStudents();
      setAllStudents(students || []);
      // Don't clear selectedStudents - keep the previously selected ones
    } catch (err) {
      alert('Lỗi tải danh sách sinh viên: ' + err.message);
    } finally {
      setLoadingStudents(false);
    }
    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setAllStudents([]);
    // Don't clear selectedStudents - keep them for form submission
    setStudentSearchTerm('');
  };

  const toggleStudent = (studentMongoId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentMongoId)) {
      newSelected.delete(studentMongoId);
      setSelectedStudentsDetails(prev => prev.filter(s => s._id !== studentMongoId));
    } else {
      newSelected.add(studentMongoId);
      const student = allStudents.find(s => s._id === studentMongoId);
      if (student) {
        setSelectedStudentsDetails(prev => [...prev, student]);
      }
    }
    setSelectedStudents(newSelected);
  };

  const saveStudents = async () => {
    // Simply close the modal and keep the selected students
    // They will be enrolled when the form is submitted in handleAdd
    closeStudentModal();
  };

  return (
    <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
        <h1 className="h3 mb-3">Thêm học phần</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleAdd}>

              <div className="mb-3">
                <label className="form-label">Mã học phần</label>
                <input type="text" className="form-control" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Tên học phần</label>
                <input type="text" className="form-control" value={courseName} onChange={(e) => setCourseName(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Số tín chỉ</label>
                <input type="number" className="form-control" value={credits} onChange={(e) => setCredits(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Giảng viên</label>
                <input type="text" className="form-control" value={professor} onChange={(e) => setProfessor(e.target.value)} disabled={loading} />
              </div>

              <div className="mb-3">
                <label className="form-label">Thời gian học</label>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label text-muted" style={{fontSize: '0.875rem'}}>Bắt đầu</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={scheduleStartTime} 
                      onChange={(e) => setScheduleStartTime(e.target.value)} 
                      disabled={loading} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted" style={{fontSize: '0.875rem'}}>Kết thúc</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={scheduleEndTime} 
                      onChange={(e) => setScheduleEndTime(e.target.value)} 
                      disabled={loading} 
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Phòng học</label>
                <select 
                  className="form-select" 
                  value={classroom} 
                  onChange={(e) => setClassroom(e.target.value)} 
                  disabled={loading}
                >
                  <option value="">-- Chọn phòng học --</option>
                  {examRooms.map(room => (
                    <option key={room._id} value={room.room}>
                      {room.room} {room.location ? `- ${room.location}` : ''} (Sức chứa: {room.capacity || room.maxStudents})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Các sinh viên đã đăng ký</label>
                <div className="d-flex gap-2 align-items-center mb-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={openStudentModal}
                    disabled={loading}
                  >
                    + Thêm sinh viên
                  </button>
                </div>
                {selectedStudentsDetails.length > 0 && (
                  <div>
                    <p className="text-muted mb-2">Các sinh viên đã chọn ({selectedStudentsDetails.length}):</p>
                    <ul className="list-group">
                      {selectedStudentsDetails.map(student => (
                          <li key={student._id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{student.studentId}</strong> - {student.name}
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                const newSelected = new Set(selectedStudents);
                                newSelected.delete(student._id);
                                setSelectedStudents(newSelected);
                                setSelectedStudentsDetails(prev => prev.filter(s => s._id !== student._id));
                              }}
                              disabled={loading}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang thêm...' : 'Thêm'}</button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {showStudentModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1050 }} />
      )}

      {showStudentModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Chọn sinh viên</h5>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 180px)' }}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm sinh viên theo mã hoặc tên..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                />
              </div>
              {loadingStudents ? (
                <p className="text-center">Đang tải...</p>
              ) : allStudents.length === 0 ? (
                <p className="text-center text-muted">Không có sinh viên nào</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-striped table-hover m-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>Chọn</th>
                        <th>Mã sinh viên</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudents
                        .filter(student => {
                          if (!studentSearchTerm) return true;
                          const search = studentSearchTerm.toLowerCase();
                          return (
                            (student.studentId || '').toLowerCase().includes(search) ||
                            (student.name || '').toLowerCase().includes(search)
                          );
                        })
                        .map(student => (
                        <tr key={student._id}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student._id)}
                              onChange={() => toggleStudent(student._id)}
                            />
                          </td>
                          <td>{student.studentId || '-'}</td>
                          <td>{student.name || '-'}</td>
                          <td>{student.class || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeStudentModal}
                disabled={loadingStudents}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveStudents}
                disabled={loadingStudents || selectedStudents.size === 0}
              >
                {loadingStudents ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAdd;
