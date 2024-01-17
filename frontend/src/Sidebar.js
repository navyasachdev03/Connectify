import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHome, faPlus, faBell } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './App.css';

const Sidebar = () => {
  return (
    <div id='sidebar' className="sidebar">
      <div className="sidebar-item">
        <Link to="/" className='link-tag'><FontAwesomeIcon icon={faHome} />
        <span>&nbsp;&nbsp;Home</span></Link>
      </div>
      <div className="sidebar-item">
      <Link to="/post" className='link-tag'><FontAwesomeIcon icon={faPlus} />
        <span>&nbsp;&nbsp;Post</span></Link>
      </div>
      <div className="sidebar-item">
      <Link to="/noti" className='link-tag'><FontAwesomeIcon icon={faBell} />
        <span>&nbsp;&nbsp;Notifications</span></Link>
      </div>
      <div className="sidebar-item">
      <Link to="/account" className='link-tag'><FontAwesomeIcon icon={faUser} />
        <span>&nbsp;&nbsp;Account</span></Link>
      </div>
    </div>
  );
};

export default Sidebar;
