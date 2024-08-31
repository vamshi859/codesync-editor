import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';

const Home = () => {

    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        // Create a new room
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    }

    const handleJoinRoom = () => {
        if(!roomId || !username){
            toast.error('Please enter both room ID and username to join a room');
            return ;
        }

        //Redirect
        navigate(`/editor/${roomId}`, { state: { username } });
    }

    const handleKeyUp = (e) => {
        if(e.code === 'Enter'){
            handleJoinRoom();
        }
    }
    
  return (
    <div className='homePageWrapper'>
        <div className='formWrapper'>
            {/* <img src='/code-sync.png' className='homePageLogo' alt='sync-logo' /> */}
            <h4 className='title'>CODE SYNC <span className='editor'>EDITOR</span></h4>
            <h4 className='mainLabel'>Paste invitation ROOM ID</h4>
            <div className='inputGroup'>
                <input type='text' onKeyUp={handleKeyUp} value={roomId} onChange={(e) => setRoomId(e.target.value)} className='inputBox' placeholder='ROOM ID' />
                <input type='text' onKeyUp={handleKeyUp} value={username} onChange={(e) => setUsername(e.target.value)} className='inputBox' placeholder='USERNAME' />
                <button className='btn joinBtn' onClick={handleJoinRoom}>Join</button>
                <span className='createInfo'>
                    If you don't have an invite then create&nbsp;
                    <a onClick={createNewRoom} href='' className='createNewBtn'>
                        New Room
                    </a>
                </span>
            </div>
        </div>
    </div>
  )
}

export default Home