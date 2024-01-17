import React, {useState} from 'react';
import './App.css'; 

function Post() {

  const [Data1, setData1] = useState({
    sno: '',
    user: '',
    title: '',
    content: '',
    image: null
  });

  const [Data2, setData2] = useState({
    sno: '',
    user: '',
    title: '',
    content: '',
    image: null
  });

  const [Data3, setData3] = useState({
    sno: '',
    user: ''
  });


  const handleChange1 = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const imageFile = e.target.files[0];
      setData1({...Data1,[name]: imageFile});
    } 
    else {
      setData1({...Data1,[name]: value});
    }

  };


  const handleChange2 = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const imageFile = e.target.files[0];
      setData2({...Data2,[name]: imageFile});
    } 
    else {
      setData2({...Data2,[name]: value});
    }

  };


  const handleChange3 = (e) => {
    const { name, value } = e.target;
    setData3({...Data3,[name]: value});
  };



  const handlePost = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/createPost/${Data1.user}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Data1),
        credentials: 'include',
      })
      .then(response => response.json())
      .then(data => {
          if (data.code === 201) {
              alert('Post created successfully');
          } else if(data.code === 404){
            alert('User not Found!')
          }
          else {
              console.error('Failed:', data.msg);
              alert('Error creating post');
          }
        })
        .catch(error => console.error('Error creating post:', error));
  }


  const handleUpdate = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/updatePost/${Data2.user}/${Data2.sno}`,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({title: Data2.title, content: Data2.content}),
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          if (data.code === 200) {
              alert('Post updated successfully');
          } else if(data.code === 404 && data.msg==='User not found'){
            alert('User not Found!')
          } else if(data.code === 404 && data.msg==='Post not found'){
            alert('Post not Found!')
          } else if (data.code === 403) {
            alert('You cannot update another users post!')
          } else {
              console.error('Failed:', data.msg);
              alert('Error updating post');
          }
        })
        .catch(error => console.error('Error updating post:', error));
  }


  const handleDelete = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/deletePost/${Data3.user}/${Data3.sno}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 200) {
          alert('Post deleted successfully');
        } else if(data.code === 404 && data.msg==='User not found'){
          alert('User not Found!')
        } else if(data.code === 404 && data.msg==='Post not found'){
          alert('Post not Found!')
        } else if (data.code === 403) {
          alert('You cannot delete another users post!')
        } else {
            console.error('Failed:', data.msg);
            alert('Error deleting post');
        }
      })
      .catch(error => console.error('Error deleting post:', error));
  }

  

  return (
    <div id='post' className='post'>
      <div className='bg-img'></div>
      <div className='post-form'>
      <div>
      
      <h1>Create Your Post...</h1>
      <div>
            <input
              type="text"
              name="user"
              placeholder="Your username..."
              value={Data1.user}
              onChange={handleChange1}
            />
            <br /><br/><br/>

            <input
              type="text"
              name="sno"
              placeholder="S.no..."
              value={Data1.sno}
              onChange={handleChange1}
            />&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;

            <input
              type="text"
              name="title"
              placeholder="Title of your post..."
              value={Data1.title}
              onChange={handleChange1}
            />
            <br /><br/><br/>
          

          <textarea
              rows={6}
              name="content"
              placeholder="Write your thoughts..."
              value={Data1.content}
              onChange={handleChange1}
            />
          <br /><br/><br/>

          <input
              type="file"
              name="image"
              onChange={handleChange1}
            />
          <br /><br/>

          <button type='submit' onClick={handlePost}>Post</button>
      </div>
      </div><br/><br/>


      <div>
      <hr></hr>
      <h1>Update Your Post...</h1>
      <div>
            <input
              type="text"
              name="user"
              placeholder="Your username..."
              value={Data2.user}
              onChange={handleChange2}
            />
            <br /><br/><br/>

            <input
              type="text"
              name="sno"
              placeholder="S.no..."
              value={Data2.sno}
              onChange={handleChange2}
            />&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;

            <input
              type="text"
              name="title"
              placeholder="Title of your post..."
              value={Data2.title}
              onChange={handleChange2}
            />
            <br /><br/><br/>
          

          <textarea
              rows={6}
              name="content"
              placeholder="Write your thoughts..."
              value={Data2.content}
              onChange={handleChange2}
            />
          <br /><br/><br/>

          <input
              type="file"
              name="image"
              onChange={handleChange2}
            />
          <br /><br/>

          <button type='submit' onClick={handleUpdate}>Update</button>
      </div>
      </div><br/><br/>


      <div>
        <hr></hr><br/>
        <h1>Delete Post...</h1>
        <input
              type="text"
              name="sno"
              placeholder="S.no..."
              value={Data3.sno}
              onChange={handleChange3}
        />&emsp;&emsp;&emsp;&emsp;&emsp;
        <input
              type="text"
              name="user"
              placeholder="Your username..."
              value={Data3.user}
              onChange={handleChange3}
        />
        <br/><br/>
        <button type='submit' onClick={handleDelete}>Delete</button>
      </div>
      </div>
    </div>
  );
}

export default Post;
