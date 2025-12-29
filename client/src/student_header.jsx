import React from "react";

const HeaderStudent = ({ title, subTitle, notificationCount = 3, children }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom bg-white p-3 rounded-3 shadow-sm">
      <div>
        <h2 className="h4 fw-bold text-dark mb-1">{title}</h2>
        <p className="text-muted small mb-0">{subTitle}</p>
      </div>

      <div className="d-flex align-items-center gap-3">
        
        <div className="d-flex align-items-center gap-2 me-2">
            <button className="btn btn-link text-secondary p-2"><i className="bi bi-plus-lg fs-5"></i></button>
            
            <button className="btn btn-link text-secondary p-2"><i className="bi bi-journal-text fs-5"></i></button>

            <div className="position-relative p-2 rounded-3" style={{ backgroundColor: '#e9ecef', cursor: 'pointer', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-bell text-dark" viewBox="0 0 16 16">
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                </svg>
                {notificationCount > 0 && (
                    <span 
                        className="position-absolute badge rounded-circle bg-primary" 
                        style={{ 
                            top: '-5px', 
                            right: '-5px', 
                            fontSize: '0.7rem',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white'
                        }}
                    >
                        {notificationCount}
                    </span>
                )}
            </div>

            <button className="btn btn-link text-secondary p-2"><i className="bi bi-three-dots-vertical fs-5"></i></button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default HeaderStudent;