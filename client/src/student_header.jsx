import React from "react";

const HeaderStudent = ({ title, subTitle, children }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom bg-white p-3 rounded-3 shadow-sm position-relative">
      <div>
        <h2 className="h4 fw-bold text-dark mb-1">{title}</h2>
        <p className="text-muted small mb-0">{subTitle}</p>
      </div>

      <div className="d-flex align-items-center gap-3">
        {children}
      </div>
    </div>
  );
};

export default HeaderStudent;