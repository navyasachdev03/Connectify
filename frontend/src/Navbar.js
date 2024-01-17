import React from 'react';
import './App.css';
import Image from 'react-bootstrap/Image';

const Navbar = () => {
    return (
      <div id='navbar' className='navbar'>
        <Image src='logo.png' className='logo-img' />
        <Image src='user.png' className='user-img' />
      </div>
    );
  }
  
export default Navbar;
  