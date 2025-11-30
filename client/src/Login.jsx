import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import UETLogo from "./assets/logo.png";

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                onLoginSuccess(data.user.role);

                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else if (data.user.role === 'student') {
                    navigate('/student');
                } else {
                    navigate('/');
                }

            } else {
                setError(data.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối đến server');
        }
    };

    return (
        <div className="d-flex" style={{ height: "100vh" }}>
            <div
                style={{
                    width: "50%",
                    backgroundColor: "#4287f5"
                }}
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


                    <form onSubmit={handleSubmit}>
                        <div className="text-start mb-3">
                            <label className="fw-semibold">Tên đăng nhập</label>
                            <input
                                type="text"
                                placeholder="Nhập username"
                                className="form-control mt-1"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="text-start mb-3">
                            <label className="fw-semibold">Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập password"
                                className="form-control mt-1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100 mt-2 py-2">
                            Đăng nhập
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}