import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { DISCONNECTED, JOIN, JOINED, SYNC_CODE } from '../Actions';
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [clients, setClients] = useState([
    ]);

    useEffect(() => {
        const init = async () => {
            try {
                socketRef.current = await initSocket();
                socketRef.current.on('connect_error', (err) => handleErrors(err));
                socketRef.current.on('connect_failed', (err) => handleErrors(err));
    
                const handleErrors = (e) => {
                    console.log('socket error',e);
                    toast.error('Socket connection failed, try again later.');
                    navigate('/');
                }
    
                socketRef.current.emit(JOIN, {
                    roomId,
                    username: location.state?.username
                });
    
                //Listening
                socketRef.current.on(JOINED, ({
                    clients,
                    username,
                    socketId
                }) => {
                    if(username !== location.state.username){
                        toast.success(`${username} joined the room`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(SYNC_CODE, {
                        socketId,
                        code: codeRef.current
                    })
                });
    
                //Listening to disconnection
                socketRef.current.on(DISCONNECTED, ({
                    socketId,
                    username
                }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(client => client.socketId!==socketId);
                    })
                });

                // Clean up function
                return () => {
                    socketRef.current.disconnect();
                    socketRef.current.off(JOINED);
                    socketRef.current.off(DISCONNECTED);
                };
            } catch (error) {
                console.log(error);
            }
        }
        init();
    }, []);

    const handleCopyRoomid =async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied to clipboard');
        } catch (error) {
            toast.error('Could not copy');
            console.log(error);
        }
    }

    const handleLeaveRoom = () => {
        window.location = '/';
    }

    if(!location.state){
        return <Navigate to={'/'} />
    }

  return (
    <div className='mainWrap'>
        <div className='aside'>
            <div className='asideInner'>
                <div className='logo'>
                    {/* <img src='/code-sync.png' alt='logo' className='logoImage' /> */}
                    <h4 className='title'>CODE SYNC <span className='editor'>EDITOR</span></h4>
                </div>
                <h3>Active Users</h3>
                <div className='clientsList'>
                    {clients && clients.map((client, index) => (
                        <Client key={index} username={client.username} />
                    ))}
                </div>
            </div>
            <button className='btn copyBtn' onClick={handleCopyRoomid}>Copy ROOM ID</button>
            <button className='btn leaveBtn' onClick={handleLeaveRoom} >Leave</button>
        </div>
        <div className='editorWrap'>
            <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {codeRef.current = code;}} />
        </div>
    </div>
  )
}

export default EditorPage