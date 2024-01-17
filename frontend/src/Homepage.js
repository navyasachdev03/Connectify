import React, { useState, useEffect } from 'react';
import './App.css';

const Homepage = ({username}) => {

  // eslint-disable-next-line
  const headings = ['Discover, Create, Connect!', 'Share your thoughts!', 'Dive into the social sphere!'];
  const [currentHeading, setCurrentHeading] = useState(headings[0]);
  const [index, setIndex] = useState(0);
  const [searchUser, setSearchUser] = useState('');
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [likes,setLikes] = useState([]);
  const [comments,setComments] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index) => (index + 1) % headings.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [headings.length]);

  useEffect(() => {
    setCurrentHeading(headings[index]);
  }, [index, headings]);



  const handleFollow = () => {
    fetch(`http://localhost:3000/follow/${searchUser}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          alert('Request sent successfully!')
        } else if(data.code === 404){
          alert('User not Found!')
        } else if (data.code === 403) {
          alert('Request already sent!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error following user');
        }
      })
      .catch(error => console.error('Error following user:', error));
  }



  const handleViewPosts = () => {
    fetch(`http://localhost:3000/getPost/${searchUser}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          setPosts(data.posts);
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if(data.code === 404 && data.msg==='User has not posted yet'){
          alert('User has not posted yet!')
        } else if (data.code === 403) {
          alert('Cannot view posts as user is not your connection')
        } else {
            console.error('Failed:', data.msg);
            alert('Error displaying post');
        }
      })
      .catch(error => console.error('Error displaying post:', error));
  }



  const handleConnections = () => {
    fetch('http://localhost:3000/checkConnections', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        setConnections(data.connections);
      } else if(data.code === 404 && data.msg==='User not found'){
        alert('User not Found!')
      } else if(data.code === 404 && data.msg==='No connections found'){
        alert('No connections found!')
      } else {
          console.error('Failed:', data.msg);
          alert('Error displaying connections');
      }
    })
    .catch(error => console.error('Error displaying connections:', error));
  }



  const handleUnfollow = () => {
    fetch(`http://localhost:3000/unfollow/${searchUser}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          alert('Unfollowed successfully')
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if (data.code === 403) {
          alert('Already not following user!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error unfollowing user');
        }
      })
      .catch(error => console.error('Error unfollowing user:', error));
  }


  const handleLike = () => {
    fetch(`http://localhost:3000/like/${posts[0].user}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          alert('Post liked successfully');
          setLikes(data.likes);
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if(data.code === 404 && data.msg==='Post not found'){
          alert('Post not Found!')
        } else if (data.code === 403) {
          alert('Post already liked!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error liking post');
        }
      })
      .catch(error => console.error('Error liking post:', error));
  }



  const handleComment = () => {
    fetch(`http://localhost:3000/comment/${posts[0].user}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          setComments(data.comment);
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if(data.code === 404 && data.msg==='Post not found'){
          alert('Post not Found!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error adding comment');
        }
      })
      .catch(error => console.error('Error adding comment:', error));
  }



  return (
    <div id='home' className='home'>

      {username ? (
        <h4>Hi, {username}!</h4>
      ) : (<p></p>)}

      <div className='cont'>
      <div className='cont2'>
      <div className='search-container'>
      <h1 className="h">{currentHeading}</h1>
      <div className="search-bar">
      <input
        type="text"
        name="followUser"
        placeholder="Search for a user..."
        value={searchUser}
        onChange={(e) => setSearchUser(e.target.value)}
      />
      <button className='follow-btn' onClick={handleFollow}>Follow</button>
      <button className='view-btn' onClick={handleViewPosts}>View Posts</button>
      <button className='unfollow-btn' onClick={handleUnfollow}>Unfollow</button>
      </div>
      </div>

      <div className='post-container'>
        {posts.length > 0 && (
          <div>
            <h2>Posts:</h2>
              {posts.map((post, index) => (
                <div key={index}  className='single-post'>
                  <div><p>{post.user}</p></div>
                  <div><strong>Title:</strong> {post.title}</div><br/>
                  <div><strong>Content:</strong> {post.content}</div><br/>
                  <div>
                    <textarea rows={2} placeholder="Add a comment..." /><br/>
                    <button onClick={handleLike}>Like</button>&emsp;&emsp;<button onClick={handleComment}>Comment</button>
                  </div>
                  <div><p>No. of likes: {likes.length}</p></div>
                  <div className='comment-container'>
                      
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      </div>


      <div className='cont2'>
      <div className='connection-container'>
        <h2>View Your Connections</h2>
        <button className='view-btn' onClick={handleConnections}>View</button>
        <div>
        {connections.length > 0 && (
          <div>
              {connections.map((connection, index) => (
                <div key={index}  className='single-connection'>
                  <p>{connection}</p>
                </div>
              ))}
          </div>
        )}
        </div>
      </div>
      
      </div>
      </div>

    </div>
  );
}

export default Homepage;
