import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import UETLogo from "./assets/logo.png";
import { getApiBase } from "./api/base";

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${await getApiBase()}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("studentId", data.user.studentId);
                localStorage.setItem("userName", data.user.name);
                localStorage.setItem("studentName", data.user.name);

                onLoginSuccess(data.user.role);

                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else if (data.user.role === 'student') {
                    navigate('/student');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối đến server. Vui lòng kiểm tra lại mạng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex" style={{ height: "100vh" }}>
            <div
                style={{ width: "50%", backgroundColor: "#4287f5" }}
                className="d-none d-md-block"
            ></div>

            <div
                className="d-flex justify-content-center align-items-center bg-white"
                style={{ width: "100%" }}
            >
                <div style={{ width: "400px", textAlign: "center", padding: "20px" }}>
                    <img
                        src={UETLogo}
                        alt="UET Logo"
                        style={{ width: "150px", marginBottom: "20px" }}
                    />

                    <h2 className="fw-bold mb-2">Đăng nhập</h2>
                    <p className="text-muted mb-4">Vui lòng nhập thông tin</p>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center justify-content-center py-2" role="alert" style={{ fontSize: '14px' }}>
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <div>{error}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="text-start mb-3">
                            <label className="fw-semibold">Tên đăng nhập</label>
                            <input
                                type="text"
                                placeholder="Nhập username"
                                className={`form-control mt-1 ${error ? 'is-invalid' : ''}`}
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if(error) setError('');
                                }}
                                required
                            />
                        </div>

                        <div className="text-start mb-3">
                            <label className="fw-semibold">Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập password"
                                className={`form-control mt-1 ${error ? 'is-invalid' : ''}`}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if(error) setError(''); 
                                }}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 mt-2 py-2 fw-bold"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : null}
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}