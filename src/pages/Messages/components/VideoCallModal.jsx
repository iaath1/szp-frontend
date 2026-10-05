import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import './VideoCallModal.css';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const VideoCallModal = ({ 
    isActive, 
    isReceivingCall, 
    callerName, 
    chatId, 
    stompClient, 
    isStompConnected,
    onEndCall,
    onIncomingCall
}) => {
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState(''); 
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    
    const pendingOffer = useRef(null);
    const pendingCandidates = useRef([]);
    
    const myName = `${localStorage.getItem("firstname")} ${localStorage.getItem("lastname")}`;

    useEffect(() => {
        console.log("VideoCallModal effect check:", { client: !!stompClient, chatId });
        if (!stompClient || !chatId) return;

        let sub = null;

        const performSubscription = () => {
            if (sub) return; // Уже подписаны
            console.log("VideoCallModal SUBSCRIBING to /topic/call/" + chatId);
            sub = stompClient.subscribe(`/topic/call/${chatId}`, async (message) => {
                try {
                    const signal = JSON.parse(message.body);
                    if (signal.sender === myName) return;

                    console.log("Received signal:", signal.type);

                    if (signal.type === 'offer') {
                        console.log("Received offer SDP:", signal.sdp);
                        pendingOffer.current = signal.sdp;
                        pendingCandidates.current = []; 
                        if (onIncomingCall) onIncomingCall(signal.sender);
                    } 
                    else if (signal.type === 'answer') {
                        if (peerConnectionRef.current) {
                            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                            setCallStatus('connected');
                            
                            pendingCandidates.current.forEach(c => {
                                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(c))
                                    .catch(e => console.error("Error adding delayed ICE candidate", e));
                            });
                            pendingCandidates.current = [];
                        }
                    } 
                    else if (signal.type === 'ice-candidate') {
                        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                            peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate))
                                .catch(e => console.error("Error adding ICE candidate", e));
                        } else {
                            pendingCandidates.current.push(signal.candidate);
                        }
                    } 
                    else if (signal.type === 'end-call') {
                        cleanupCall();
                        if (onEndCall) onEndCall();
                    }
                } catch (err) {
                    console.error("Error processing signal:", err);
                }
            });
        };

        let interval = null;
        if (stompClient.connected) {
            performSubscription();
        } else {
            interval = setInterval(() => {
                if (stompClient.connected) {
                    performSubscription();
                    clearInterval(interval);
                }
            }, 500);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (sub) sub.unsubscribe();
        };
    }, [stompClient, chatId]);

    useEffect(() => {
        if (!isActive) {
            cleanupCall();
            return;
        }
        
        if (isActive && !isReceivingCall) {
            setCallStatus('calling...');
            startCall();
        } else if (isReceivingCall) {
            setCallStatus('incoming call...');
        }
    }, [isActive, isReceivingCall]);

    const sendSignal = (type, payload) => {
        if (stompClient && stompClient.connected) {
            console.log("Sending signal:", type);
            stompClient.publish({
                destination: `/app/chat/${chatId}/signal`,
                body: JSON.stringify({ type, sender: myName, ...payload })
            });
        }
    };

    const setupPeerConnection = () => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal('ice-candidate', { candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log("Received remote track");
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setCallStatus('connected');
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        peerConnectionRef.current = pc;
        return pc;
    };

    const getMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return true;
        } catch (error) {
            console.error('Error accessing media', error);
            alert('Cannot access camera and microphone. Please allow permissions.');
            return false;
        }
    };

    const startCall = async () => {
        try {
            const gotMedia = await getMedia();
            if (!gotMedia) {
                if (onEndCall) onEndCall();
                return;
            }

            const pc = setupPeerConnection();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            console.log("Sending offer:", offer);
            sendSignal('offer', { sdp: offer });
        } catch (error) {
            console.error("Failed to start call", error);
            cleanupCall();
            if (onEndCall) onEndCall();
        }
    };

    const answerCall = async () => {
        try {
            console.log("Starting answerCall...");
            const gotMedia = await getMedia();
            if (!gotMedia) {
                console.log("Failed to get media");
                rejectCall();
                return;
            }

            setCallStatus('connecting...');
            
            if (!pendingOffer.current) {
                throw new Error("No pending offer found! Cannot connect.");
            }

            console.log("Setting up PeerConnection...");
            const pc = setupPeerConnection();
            
            console.log("Setting remote description...", pendingOffer.current);
            await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.current));
            
            console.log("Creating answer...");
            const answer = await pc.createAnswer();
            
            console.log("Setting local description...");
            await pc.setLocalDescription(answer);
            
            console.log("Sending answer...");
            sendSignal('answer', { sdp: pc.localDescription });

            console.log("Processing pending candidates...", pendingCandidates.current.length);
            pendingCandidates.current.forEach(c => {
                if (c) {
                    pc.addIceCandidate(new RTCIceCandidate(c))
                        .catch(e => console.error("Error adding delayed ICE candidate", e));
                }
            });
            pendingCandidates.current = [];
        } catch (error) {
            console.error("Failed to answer call", error);
            alert("Error in answerCall: " + error.message + "\nCheck console for more details.");
            rejectCall();
        }
    };

    const rejectCall = () => {
        sendSignal('end-call', {});
        cleanupCall();
        if (onEndCall) onEndCall();
    };

    const cleanupCall = () => {
        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        } catch (e) {
            console.error("Error during cleanup", e);
        }
        pendingOffer.current = null;
        pendingCandidates.current = [];
        setCallStatus('');
    };

    const handleHangUp = () => {
        sendSignal('end-call', {});
        cleanupCall();
        if (onEndCall) onEndCall();
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    if (!isActive) return null;

    return (
        <div className="video-call-overlay">
            <div className="video-call-modal">
                <div className="video-streams-container">
                    <div className="remote-video-wrapper">
                        <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                        
                        {(callStatus === 'calling...' || callStatus === 'incoming call...' || callStatus === 'connecting...') && (
                            <div className="call-status-overlay">
                                <div className="caller-avatar-placeholder">
                                    {callerName ? callerName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <h2>{callerName}</h2>
                                <p>{callStatus}</p>
                                
                                {isReceivingCall && callStatus === 'incoming call...' && (
                                    <div className="incoming-actions">
                                        <button className="accept-btn" onClick={answerCall}>Answer</button>
                                        <button className="reject-btn" onClick={rejectCall}>Decline</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="local-video-wrapper">
                        <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
                    </div>
                </div>

                {(!isReceivingCall || callStatus === 'connected' || callStatus === 'connecting...') && (
                    <div className="call-controls">
                        <button className={`control-btn ${isAudioMuted ? 'muted' : ''}`} onClick={toggleAudio}>
                            {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        <button className="control-btn hangup" onClick={handleHangUp}>
                            <PhoneOff size={24} />
                        </button>
                        <button className={`control-btn ${isVideoOff ? 'muted' : ''}`} onClick={toggleVideo}>
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCallModal;
