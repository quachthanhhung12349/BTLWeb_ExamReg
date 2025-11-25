import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const StudentManagement = () => {
    return (
        <div id="page-content-wrapper">
            <nav class="navbar navbar-light bg-light border-bottom p-3">
                <h1 class="h3 mb-0">Quản lý sinh viên</h1>
                <button class="btn btn-primary">
                    + Thêm sinh viên
                </button>
            </nav>

            <div class="container-fluid py-4">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Mã sinh viên</th>
                                    <th>Họ tên sinh viên</th>
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

export default StudentManagement;