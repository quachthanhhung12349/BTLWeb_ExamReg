import React from 'react';

const LayoutAdmin = ({ children, activeLink }) => {
    return (
        <div className="layout-admin">
            <SidebarAdmin activeLink={activeLink} />
            <div className="content-area">
                {children}
            </div>
        </div>
    );  
};

export default LayoutAdmin;