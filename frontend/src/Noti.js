import React, {useState} from 'react';
import './App.css';

const Noti = () => {

    const [requests, setRequests] = useState([]);
    const [requestUser, setRequestUser] = useState('');

    const handleRequests = () => {
      fetch('http://localhost:3000/getRequests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          setRequests(data.requests);
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if(data.code === 404 && data.msg==='No requests found'){
          alert('No requests found!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error displaying requests');
        }
      })
      .catch(error => console.error('Error displaying requests:', error));
    }


    const handleAcceptRequest = () => {
      fetch(`http://localhost:3000/acceptRequest/${requestUser}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          alert('Request accepted successfully!')
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if(data.code === 403){
          alert('No request found to accept!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error accepting request');
        }
      })
      .catch(error => console.error('Error accepting request:', error));
    }



    const handleRejectRequest = () => {
      fetch(`http://localhost:3000/rejectRequest/${requestUser}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          alert('Request rejected successfully!')
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if(data.code === 403){
          alert('No request found to reject!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error rejecting request');
        }
      })
      .catch(error => console.error('Error rejecting request:', error));
    }



    return (
      <div id='noti' className='noti'>
        <div className='cont4'>
          <h2>Your Requests...</h2>
          <button onClick={handleRequests}>View</button>
        </div>
        <div className='request-container'>
        {requests.length > 0 && (
          <div>
              {requests.map((request, index) => (
                <div key={index}  className='single-request'>
                  <p>{request}</p>
                </div>
              ))}
              <div className='cont3'>
                <input
                  type="text"
                  name="rejectOrAcceptUser"
                  placeholder="Enter username..."
                  value={requestUser}
                  onChange={(e) => setRequestUser(e.target.value)}
                />
                <button onClick={handleAcceptRequest}>Accept Request</button>
                <button onClick={handleRejectRequest}>Reject Request</button>
              </div>
          </div>
        )}
      </div>
      </div>
    );
}
  
export default Noti;
  