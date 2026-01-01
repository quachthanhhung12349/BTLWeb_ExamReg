import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCourse, updateCourse, enrollStudentsInCourse, removeStudentFromCourse } from './api/course_api.jsx';
import { fetchStudents } from './api/student_api.jsx';
import { getStudentsByCourse } from './api/courseStudent_api.jsx';
import { fetchExamRooms } from './api/exam_room_api.jsx';
import { exportTableToExcel } from './utils/excelExport';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseEdit = () => {
  const { id } = useParams();
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
  const [courseStudents, setCourseStudents] = useState([]);
  const [courseStudentsDetails, setCourseStudentsDetails] = useState([]);
  const [enrolledStudentsFromArray, setEnrolledStudentsFromArray] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await fetchCourse(id);
        if (mounted) {
          if (!c) return navigate('/admin/course');
          setCourseId(c.courseId || '');
          setCourseName(c.courseName || '');
          setCredits(c.credits || '');
          setProfessor(c.professor || '');
          
          // Parse schedule times
          if (c.schedule && c.schedule.time) {
            const times = c.schedule.time.split('-');
            if (times.length === 2) {
              setScheduleStartTime(times[0].trim());
              setScheduleEndTime(times[1].trim());
            }
          }
          
          setClassroom(c.schedule?.location || '');

          // Fetch exam rooms
          try {
            const rooms = await fetchExamRooms();
            if (mounted) {
              setExamRooms(Array.isArray(rooms) ? rooms : rooms.rooms || []);
            }
          } catch (err) {
            console.error('Failed to fetch exam rooms:', err);
          }

          // Fetch course's students from CourseStudent collection
          try {
            const result = await getStudentsByCourse(c.courseId);
            if (mounted) {
              setCourseStudents(result.list || []);
              // Fetch all students to get full details
              const allStudentsData = await fetchStudents();
              const detailedStudents = result.list.map(cs => {
                const studentDetail = allStudentsData.find(s => s.studentId === cs.studentId);
                return studentDetail || { studentId: cs.studentId, name: cs.studentId };
              });
              setCourseStudentsDetails(detailedStudents);
            }
          } catch (err) {
            console.error('Failed to fetch course students:', err);
          }
          
          // Get students from enrolledStudents array
          if (c.enrolledStudents && c.enrolledStudents.length > 0) {
            try {
              const allStudentsData = await fetchStudents();
              const enrolledDetails = c.enrolledStudents.map(es => {
                const studentDetail = allStudentsData.find(s => s._id === es.studentId || s.studentId === es.studentId);
                return studentDetail || { _id: es.studentId, studentId: es.studentName || es.studentId, name: es.studentName };
              });
              if (mounted) {
                setEnrolledStudentsFromArray(enrolledDetails);
              }
            } catch (err) {
              console.error('Failed to fetch enrolledStudents details:', err);
            }
          }
        }
      } catch (err) {
        navigate('/admin/course');
      }
    })();
    return () => (mounted = false);
  }, [id, navigate]);

  const handleOk = async (e) => {
    e.preventDefault();
    setError('');
    if (!courseId || !courseName) {
      setError('Vui lòng điền tất cả các trường.');
      return;
    }
    setLoading(true);
    try {
      const scheduleTime = scheduleStartTime && scheduleEndTime 
        ? `${scheduleStartTime} - ${scheduleEndTime}`
        : '';
      
      const updateData = {
        courseId,
        courseName,
        credits: credits ? Number(credits) : undefined,
        professor,
        schedule: {
          time: scheduleTime,
          location: classroom
        }
      };
      
      await updateCourse(id, updateData);
      navigate('/admin/course');
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật học phần.');
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
      
      // Initialize selected students from courseStudents
      const selectedSet = new Set();
      courseStudents.forEach(cs => {
        const student = students?.find(s => s.studentId === cs.studentId);
        if (student) {
          selectedSet.add(student._id);
        }
      });
      setSelectedStudents(selectedSet);
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
    setSelectedStudents(new Set());
    setStudentSearchTerm('');
  };

  const toggleStudent = (studentMongoId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentMongoId)) {
      newSelected.delete(studentMongoId);
    } else {
      newSelected.add(studentMongoId);
    }
    setSelectedStudents(newSelected);
  };

  const saveStudents = async () => {
    setLoadingStudents(true);
    try {
      // Remove students that are no longer selected
      for (const cs of courseStudents) {
        const studentInAllStudents = allStudents.find(s => s.studentId === cs.studentId);
        if (studentInAllStudents && !selectedStudents.has(studentInAllStudents._id)) {
          await removeStudentFromCourse(id, studentInAllStudents._id);
        }
      }

      // Add new selected students - collect all IDs to add at once
      const studentsToAdd = [];
      for (const studentMongoId of selectedStudents) {
        const student = allStudents.find(s => s._id === studentMongoId);
        if (student && !courseStudents.some(cs => cs.studentId === student.studentId)) {
          studentsToAdd.push(studentMongoId);
        }
      }
      
      // Add all new students at once
      if (studentsToAdd.length > 0) {
        await enrollStudentsInCourse(id, studentsToAdd);
      }

      // Refresh course students from CourseStudent collection
      const result = await getStudentsByCourse(courseId);
      setCourseStudents(result.list || []);
      // Update student details
      const detailedStudents = result.list.map(cs => {
        const studentDetail = allStudents.find(s => s.studentId === cs.studentId);
        return studentDetail || { studentId: cs.studentId, name: cs.studentId };
      });
      setCourseStudentsDetails(detailedStudents);
      
      // Refresh enrolledStudents array from Course document
      const updatedCourse = await fetchCourse(id);
      if (updatedCourse.enrolledStudents && updatedCourse.enrolledStudents.length > 0) {
        const allStudentsData = await fetchStudents();
        const enrolledDetails = updatedCourse.enrolledStudents.map(es => {
          const studentDetail = allStudentsData.find(s => s._id === es.studentId || s.studentId === es.studentId);
          return studentDetail || { _id: es.studentId, studentId: es.studentName || es.studentId, name: es.studentName };
        });
        setEnrolledStudentsFromArray(enrolledDetails);
      } else {
        setEnrolledStudentsFromArray([]);
      }
      
      closeStudentModal();
    } catch (err) {
      alert('Lỗi cập nhật sinh viên: ' + err.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Xuất Excel danh sách sinh viên đang học
  const handleExportStudents = async () => {
    if (courseStudentsDetails.length === 0) {
      alert('Không có sinh viên nào để xuất!');
      return;
    }

    try {
      const columns = [
        { header: 'STT', key: 'index', width: 8 },
        { header: 'Mã sinh viên', key: 'studentId', width: 20 },
        { header: 'Họ tên', key: 'name', width: 35 },
        { header: 'Ngày sinh', key: 'birthday', width: 22 },
        { header: 'Lớp', key: 'class', width: 20 }
      ];

      const tableData = courseStudentsDetails.map((s, index) => ({
        index: (index + 1).toString(),
        studentId: s.studentId || '-',
        name: s.name || '-',
        birthday: (s.birthDate || s.birthday)
          ? new Date(s.birthDate || s.birthday).toLocaleDateString('vi-VN')
          : '-',
        class: s.class || '-'
      }));

      const filename = `DanhSachSinhVien_${courseId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportTableToExcel(
        tableData, 
        columns, 
        filename,
        'Danh sách sinh viên',
        `Danh Sách Sinh Viên Học Phần: ${courseId} - ${courseName}`
      );
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };


  return (
    <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
        <h1 className="h3 mb-3">Chỉnh sửa học phần</h1>
      </div>

      <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleOk}>
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
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleExportStudents}
                    disabled={courseStudentsDetails.length === 0 && enrolledStudentsFromArray.length === 0}
                  >
                    📥 Xuất Excel
                  </button>
                </div>
                
                {/* Display students from CourseStudent collection */}
                {courseStudentsDetails.length > 0 && (
                  <div className="mb-3">
                    <p className="text-muted mb-2">Sinh viên từ CourseStudent ({courseStudentsDetails.length}):</p>
                    <ul className="list-group">
                      {courseStudentsDetails.map((student, idx) => (
                        <li key={student._id || idx} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{student.studentId}</strong> - {student.name}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              try {
                                await removeStudentFromCourse(id, student._id);
                                const result = await getStudentsByCourse(courseId);
                                setCourseStudents(result.list || []);
                                // Update student details
                                const allStudentsData = await fetchStudents();
                                const detailedStudents = result.list.map(cs => {
                                  const studentDetail = allStudentsData.find(s => s.studentId === cs.studentId);
                                  return studentDetail || { studentId: cs.studentId, name: cs.studentId };
                                });
                                setCourseStudentsDetails(detailedStudents);
                                
                                // Refresh enrolledStudents array
                                const updatedCourse = await fetchCourse(id);
                                if (updatedCourse.enrolledStudents && updatedCourse.enrolledStudents.length > 0) {
                                  const enrolledDetails = updatedCourse.enrolledStudents.map(es => {
                                    const studentDetail = allStudentsData.find(s => s._id === es.studentId || s.studentId === es.studentId);
                                    return studentDetail || { _id: es.studentId, studentId: es.studentName || es.studentId, name: es.studentName };
                                  });
                                  setEnrolledStudentsFromArray(enrolledDetails);
                                } else {
                                  setEnrolledStudentsFromArray([]);
                                }
                              } catch (err) {
                                alert('Lỗi xóa sinh viên: ' + err.message);
                              }
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
                
                {/* Display students from enrolledStudents array */}
                {enrolledStudentsFromArray.length > 0 && (
                  <div>
                    <p className="text-muted mb-2">Sinh viên từ enrolledStudents array ({enrolledStudentsFromArray.length}):</p>
                    <ul className="list-group">
                      {enrolledStudentsFromArray.map((student, idx) => (
                        <li key={student._id || idx} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{student.studentId}</strong> - {student.name}
                          </div>
                          <span className="badge bg-secondary">Từ mảng</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {courseStudentsDetails.length === 0 && enrolledStudentsFromArray.length === 0 && (
                  <p className="text-muted">Chưa có sinh viên đăng ký.</p>
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel} disabled={loading}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Đang cập nhật...' : 'OK'}</button>
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
                disabled={loadingStudents}
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

export default CourseEdit;
