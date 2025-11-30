import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const ExamRoomManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    return (
       <div id="page-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Section */}
            <div className="bg-white border-bottom p-4" style={{ borderRadius: 0 }}>
                <h1 className="h3 mb-3">Quản lý ca thi</h1>
                
                {/* Search Bar and Button Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                    {/* Search Bar */}
                    <div className="input-group" style={{ maxWidth: '900px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm phòng thi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '0.375rem' }}
                        />
                        <button className="btn btn-outline-secondary" type="button" id="search-button">
                            🔍
                        </button>
                    </div>
                    {/* Add Button */}
                    <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        + Thêm ca thi
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="container-fluid p-4" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                <div className="card" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                    <div className="card-body p-0">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped table-hover m-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ padding: '1rem' }}>STT</th>
                                        <th style={{ padding: '1rem' }}>Giảng đường</th>
                                        <th style={{ padding: '1rem' }}>Tên phòng thi</th>
                                        <th style={{ padding: '1rem' }}>Sức chứa</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '1rem' }}>0001</td>
                                        <td style={{ padding: '1rem' }}>Giảng đường A</td>
                                        <td style={{ padding: '1rem' }}>Phòng 101</td>
                                        <td style={{ padding: '1rem' }}>50</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button className="btn btn-sm btn-outline-secondary">✎</button>
                                            <button className="btn btn-sm btn-outline-danger ms-2">🗑</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid #e9ecef' }}>
                            <span className="text-muted">Hiển thị 1-10 trên 1234</span>
                            <div>
                                <button className="btn btn-outline-secondary me-2">Trước</button>
                                <button className="btn btn-outline-secondary">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExamRoomManagement;