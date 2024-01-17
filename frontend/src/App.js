import React, {useState} from 'react';
import './App.css';
import Homepage from './Homepage';
import Navbar from './Navbar';
import Sidebar from './Sidebar'
import Post from './Post';
import Account from './Account';
import Noti from './Noti';
import { Routes, Route, useNavigate } from 'react-router-dom';

const App = () => {

  const [showUsername, setShowUsername] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (username) => {
    setShowUsername(username);
    navigate('/');
  };

  const handleLogout = () => {
    setShowUsername(null);
    navigate('/');
  };


  return (
    <div className="App">
      <Navbar /> 
      <Sidebar />
      <div className="content">
        <Routes>
          <Route path="/account" element={<Account onLogin={handleLogin} onLogout={handleLogout} />} />
          <Route path="/post" element={<Post/>} />
          <Route exact path="/" element={<Homepage  username={showUsername}/>} />
          <Route path="/noti" element={<Noti/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default App;
