import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const DashboardAdmin = () => {
    return (
        <div id="page-content-wrapper">
            <nav className="navbar navbar-light bg-light border-bottom p-3">
                <h1 className="h3 mb-0">Dashboard Admin</h1>
            </nav>

            <div className="container-fluid py-4">
                <div className="card">
                    <div className="card-body">
                        <h2>Welcome to the Admin Dashboard</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardAdmin;