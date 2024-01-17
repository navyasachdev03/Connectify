import React, { useState } from 'react';
import Image from 'react-bootstrap/Image';
import './App.css'; 

const Account = ({ onLogin, onLogout }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    username: '',
    password: '',
  });

  const handleLogin = () => {
    
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username, password: formData.password}),
        credentials: 'include',
    })
        .then(response => response.json())
        .then(data => {
            console.log('Login response:', data);
            if (data.code === 200) {
                onLogin(data.user.username);
                alert('Login successful');
            } else if(data.code === 401){
              alert('Invalid Credentials. Please try again')
            }
            else {
                console.error('Login failed:', data.msg);
                alert('Error logging into account');
            }
        })
        .catch(error => console.error('Error logging in:', error));
  };
  
  
  const handleLogout = () => {
    
    fetch('http://localhost:3000/logout', {
        method: 'GET',
        credentials: 'include', // Send cookies for authentication
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                onLogout();
                alert('Logout successful');
            } else {
                console.error('Logout failed:', data.msg);
            }
        })
        .catch(error => console.error('Error logging out:', error));
  };
  

  const handleSignup = () => {
    
    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name, contact: formData.contact, username: formData.username, password: formData.password }),
        credentials: 'include',
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 201) {
                alert('Signup Successful')
            } else if (data.code === 409) {
              alert('Username already exists. Please choose a different username.');
            }
            else {
                console.error('Registration failed:', data.msg);
            }
        })
        .catch(error => console.error('Error registering:', error));
  };

  const handleClear = () => {
    setFormData({
      name: '',
      contact: '',
      username: '',
      password: '',
    });
  };

  return (
    <div id="account" className="account">
      <div className="down">
        <h1>Come Together & <br/> &emsp;&emsp;&emsp;&emsp; Share Your Mood! </h1>
        <Image src="account.jpg" className="account-image" />
      </div>
      <div className="up">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

      {isLogin ? (            
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />) : (      
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />)}

      <br/>

      {isLogin ? (
            <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
      ) : (
        <input
        type="text"
        placeholder="Contact"
        value={formData.contact}
        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
      />
      )}

      <br/>

      {isLogin ? (<p></p>) : (
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
      )}

      {isLogin ? (<p></p>):(<br/>)}

      {isLogin ? (<p></p>) : (
            <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
      )}

      {isLogin ? (<p></p>):(<br/>)}

      {isLogin ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={handleSignup}>Sign Up</button>
      )}
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Create an account' : 'Already have an account?'}
      </p>
      {isLogin ? (<button onClick={handleLogout}>Logout</button>) : (<button onclick={handleClear}>Clear</button>)}
      </div>
    </div>
  );
};



export default Account;

