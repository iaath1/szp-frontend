import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import chatApi from '../../api/chat';
import VideoCallModal from './components/VideoCallModal.jsx';
import { getAvatarUrl } from '../../utils/avatar.js';
import './Messages.css';

const MessagesPage = () => {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    // Состояния для видеозвонка
    const [isCallActive, setIsCallActive] = useState(false);
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [callerName, setCallerName] = useState('');

    const [isStompConnected, setIsStompConnected] = useState(false);
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    const queryChatId = new URLSearchParams(window.location.search).get('chatId');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatApi.getChats();
                setConversations(data);
                
                if (queryChatId) {
                    const target = data.find(c => c.id === parseInt(queryChatId));
                    if (target) {
                        setActiveChat(target);
                    } else if (data.length > 0) {
                        setActiveChat(data[0]);
                    }
                } else if (data.length > 0) {
                    setActiveChat(data[0]);
                }
            } catch (error) {
                console.error('Failed to load chats', error);
            }
        };
        fetchChats();
    }, [queryChatId]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                console.log('Connected to WebSocket');
                setIsStompConnected(true);
            },
            onDisconnect: () => setIsStompConnected(false),
            onStompError: (frame) => console.error('Broker error: ' + frame.headers['message'])
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client) client.deactivate();
        };
    }, []);

    useEffect(() => {
        if (!activeChat) return;

        const loadMessages = async () => {
            try {
                const data = await chatApi.getMessages(activeChat.id);
                const myName = `${localStorage.getItem("firstname")} ${localStorage.getItem("lastname")}`;
                const processedData = data.map(msg => ({
                    ...msg,
                    isMine: msg.sender === myName
                }));
                setMessages(processedData);
            } catch (error) {
                console.error('Failed to load messages', error);
            }
        };
        loadMessages();

        let chatSub = null;
        const myName = `${localStorage.getItem("firstname")} ${localStorage.getItem("lastname")}`;

        if (stompClientRef.current && isStompConnected) {
            chatSub = stompClientRef.current.subscribe(`/topic/chat/${activeChat.id}`, (message) => {
                const newMsg = JSON.parse(message.body);
                if (newMsg.sender === myName) newMsg.isMine = true;
                setMessages(prev => [...prev, newMsg]);
            });
        }

        return () => {
            if (chatSub) chatSub.unsubscribe();
        };
    }, [activeChat, isStompConnected]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !activeChat || !stompClientRef.current) return;
        stompClientRef.current.publish({
            destination: `/app/chat/${activeChat.id}/sendMessage`,
            body: JSON.stringify({ text: newMessage })
        });
        setNewMessage('');
    };

    const handleStartCall = () => {
        setCallerName(activeChat.name);
        setIsReceivingCall(false);
        setIsCallActive(true);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header title="Messages" subtitle="Communicate with your team in real-time" />
                <div className="dashboard-content messages-content">
                    
                    <div className="chat-container">
                        <aside className="chat-sidebar">
                            <div className="chat-search">
                                <Search size={18} color="#9CA3AF" />
                                <input type="text" placeholder="Search messages..." />
                            </div>
                            <div className="conversations-list">
                                {conversations.map(conv => (
                                    <div key={conv.id} className={`conversation-item ${activeChat?.id === conv.id ? 'active' : ''}`} onClick={() => setActiveChat(conv)}>
                                        <div className="conversation-avatar">
                                            <img src={getAvatarUrl(conv.avatar, conv.name)} alt={conv.name} />
                                            {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                                        </div>
                                        <div className="conversation-info">
                                            <div className="conversation-header">
                                                <h4>{conv.name}</h4>
                                                <span className="conversation-time">{conv.time}</span>
                                            </div>
                                            <p className={`conversation-last-msg ${conv.unread > 0 ? 'unread-text' : ''}`}>{conv.lastMessage}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <div className="chat-main">
                            {activeChat ? (
                                <>
                                    <div className="chat-header">
                                        <div className="chat-header-info">
                                            <img src={getAvatarUrl(activeChat.avatar, activeChat.name)} alt={activeChat.name} />
                                            <div>
                                                <h3>{activeChat.name}</h3>
                                                <span className="status-online">Online</span>
                                            </div>
                                        </div>
                                        <div className="chat-header-actions">
                                            <button className="icon-btn"><Phone size={18} /></button>
                                            <button className="icon-btn" onClick={handleStartCall} title="Start Video Call"><Video size={18} /></button>
                                            <button className="icon-btn"><MoreVertical size={18} /></button>
                                        </div>
                                    </div>

                                    <div className="chat-history">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={`chat-bubble-wrapper ${msg.isMine ? 'mine' : 'theirs'}`}>
                                                <div className="chat-bubble">
                                                    {!msg.isMine && <span className="msg-sender-name">{msg.sender}</span>}
                                                    <p>{msg.text}</p>
                                                    <span className="msg-time">{msg.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="chat-input-area">
                                        <button className="icon-btn attach-btn"><Paperclip size={20} /></button>
                                        <input 
                                            type="text" 
                                            placeholder="Type your message..." 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <button className="send-btn" onClick={handleSendMessage}><Send size={18} /></button>
                                    </div>
                                </>
                            ) : (
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF'}}>
                                    Select a chat to start messaging
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <VideoCallModal 
                isActive={isCallActive}
                isReceivingCall={isReceivingCall}
                callerName={callerName}
                chatId={activeChat?.id}
                stompClient={stompClientRef.current}
                isStompConnected={isStompConnected}
                onEndCall={() => {
                    setIsCallActive(false);
                    setIsReceivingCall(false);
                }}
                onIncomingCall={(name) => {
                    setCallerName(name);
                    setIsReceivingCall(true);
                    setIsCallActive(true);
                }}
            />
        </div>
    );
};

export default MessagesPage;
