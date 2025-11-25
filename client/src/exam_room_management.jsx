import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const ExamRoomManagement = () => {
    return (
        <div id="page-content-wrapper">
            <nav class="navbar navbar-light bg-light border-bottom p-3">
                <h1 class="h3 mb-0">Quản lý phòng thi</h1>
                <button class="btn btn-primary">
                    + Thêm phòng thi
                </button>
            </nav>

            <div class="container-fluid py-4">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Giảng đường</th>
                                    <th>Phòng thi</th>
                                    <th>Sức chứa</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                </tbody>
                        </table>
                        <div class="d-flex justify-content-end align-items-center mt-3">
                            <span class="me-3">Hiển thị 1-10 trên 1234</span>
                            <button class="btn btn-outline-secondary me-2">Trước</button>
                            <button class="btn btn-outline-secondary">Sau</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExamRoomManagement;