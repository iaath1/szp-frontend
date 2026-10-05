import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Link as LinkIcon, Paperclip, MessageSquare, AlertCircle, Edit3, Save, MoreHorizontal, User, Flag, CheckSquare, Download, FileText, Plus } from 'lucide-react';
import { getAvatarUrl } from '../../../utils/avatar.js';
import './TaskDetailsDrawer.css';
import FileUpload from '../../../components/FileUpload/FileUpload.jsx';
import tasksApi from '../../../api/tasks.js';

const TaskDetailsDrawer = ({ task, projectId, onClose, onTaskUpdated }) => {
    const [attachments, setAttachments] = useState([]);
    const [subtasks, setSubtasks] = useState([]);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (task) {
            tasksApi.getTaskComments(task.id)
                .then(data => setComments(data))
                .catch(err => console.error("Failed to load comments", err));
        }
        if (task && task.attachments) {
            setAttachments(task.attachments);
        } else {
            setAttachments([]);
        }
        
        if (task && task.subtasks) {
            setSubtasks(task.subtasks.map(s => ({
                ...s, 
                completed: s.completed !== undefined ? s.completed : (s.isCompleted || false)
            })));
        } else {
            setSubtasks([]);
        }
    }, [task?.id]);

    if (!task) return null;

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper to extract assignee name/email
    const getAssigneeName = (assignee) => {
        if (!assignee) return 'Unassigned';
        return typeof assignee === 'string' ? assignee : assignee.email || 'Unassigned';
    };

    const handleUploadSuccess = async (data) => {
        try {
            const fileId = data.id;
            const updatedTask = await tasksApi.addAttachment(task.id, fileId);
            setAttachments(updatedTask.attachments);
            if (onTaskUpdated) onTaskUpdated(updatedTask);
        } catch (error) {
            console.error("Failed to link attachment to task:", error);
        }
    };

    const handleRemoveAttachment = async (fileId) => {
        try {
            const updatedTask = await tasksApi.removeAttachment(task.id, fileId);
            setAttachments(updatedTask.attachments);
            if (onTaskUpdated) onTaskUpdated(updatedTask);
        } catch (error) {
            console.error("Failed to remove attachment:", error);
        }
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return;
        
        try {
            const newSubtask = await tasksApi.addSubtask(task.id, { 
                title: newSubtaskTitle, 
                completed: false,
                isCompleted: false
            });
            // Ensure frontend state has completed flag mapped correctly
            const normalizedSubtask = { ...newSubtask, completed: newSubtask.completed || newSubtask.isCompleted || false };
            const newSubtasks = [...subtasks, normalizedSubtask];
            setSubtasks(newSubtasks);
            if (onTaskUpdated) onTaskUpdated({ ...task, subtasks: newSubtasks });
            setNewSubtaskTitle('');
            setIsAddingSubtask(false);
        } catch (error) {
            console.error("Failed to add subtask:", error);
        }
    };

    const handleToggleSubtask = async (subtaskId, completedStatus) => {
        // Optimistic update
        const newSubtasks = subtasks.map(s => s.id === subtaskId ? { ...s, completed: completedStatus, isCompleted: completedStatus } : s);
        setSubtasks(newSubtasks);
        if (onTaskUpdated) onTaskUpdated({ ...task, subtasks: newSubtasks });
        
        try {
            const subtaskToUpdate = subtasks.find(s => s.id === subtaskId);
            await tasksApi.updateSubtask(task.id, subtaskId, { 
                ...subtaskToUpdate, 
                completed: completedStatus,
                isCompleted: completedStatus
            });
        } catch (error) {
            console.error("Failed to update subtask:", error);
            // Revert on error
            const revertedSubtasks = subtasks.map(s => s.id === subtaskId ? { ...s, completed: !completedStatus, isCompleted: !completedStatus } : s);
            setSubtasks(revertedSubtasks);
            if (onTaskUpdated) onTaskUpdated({ ...task, subtasks: revertedSubtasks });
        }
    };

    const handleDeleteSubtask = async (subtaskId) => {
        try {
            await tasksApi.deleteSubtask(task.id, subtaskId);
            const newSubtasks = subtasks.filter(s => s.id !== subtaskId);
            setSubtasks(newSubtasks);
            if (onTaskUpdated) onTaskUpdated({ ...task, subtasks: newSubtasks });
        } catch (error) {
            console.error("Failed to delete subtask:", error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const comment = await tasksApi.addComment(task.id, newComment);
            setComments([...comments, comment]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await tasksApi.deleteComment(task.id, commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="task-drawer-backdrop" onClick={onClose}></div>

            {/* Drawer */}
            <div className={`task-drawer ${task ? 'open' : ''}`}>
                <div className="task-drawer-header">
                    <div className="tdh-left">
                        <span className={`task-status ${task.status?.toLowerCase().replace(' ', '-') || 'to-do'}`}>
                            {task.status || 'To Do'}
                        </span>
                        <span className="task-id">#WEB-{task.id}</span>
                    </div>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="task-drawer-content">
                    <h2 className="task-drawer-title">{task.title}</h2>

                    <div className="task-meta-grid">
                        <div className="tm-item">
                            <span className="tm-label"><User size={14} /> Assignee</span>
                            <div className="tm-value flex-align">
                                {task.assignee ? (
                                    <img src={getAvatarUrl(task.assignee?.avatarUrl, getAssigneeName(task.assignee))} alt="assignee" className="tm-avatar" />
                                ) : (
                                    <div className="tm-avatar" style={{ background: '#E5E7EB' }}></div>
                                )}
                                <span>{getAssigneeName(task.assignee)}</span>
                            </div>
                        </div>

                        <div className="tm-item">
                            <span className="tm-label"><CalendarIcon size={14} /> Due Date</span>
                            <div className="tm-value">{formatDate(task.deadlineAt)}</div>
                        </div>

                        <div className="tm-item">
                            <span className="tm-label"><Flag size={14} /> Priority</span>
                            <div className="tm-value">
                                <span className={`priority-badge ${task.priority?.toLowerCase() || 'none'}`}>
                                    {task.priority || 'None'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="task-section">
                        <h3>Description</h3>
                        <div className="task-description">
                            {task.description ? (
                                <p>{task.description}</p>
                            ) : (
                                <p className="text-muted">No description provided.</p>
                            )}
                        </div>
                    </div>

                    <div className="task-section">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3>Subtasks {subtasks.length > 0 && `(${subtasks.filter(s => s.completed).length}/${subtasks.length})`}</h3>
                            {!isAddingSubtask && (
                                <button className="btn-icon-small" onClick={() => setIsAddingSubtask(true)}>
                                    <Plus size={16} style={{ color: 'var(--accent-color)' }} />
                                </button>
                            )}
                        </div>

                        {subtasks.length > 0 && (
                            <div className="subtasks-progress">
                                <div 
                                    className="subtasks-progress-fill" 
                                    style={{ width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%` }}
                                ></div>
                            </div>
                        )}
                        
                        <div className="task-subtasks">
                            {subtasks.length === 0 && !isAddingSubtask ? (
                                <div className="empty-state">
                                    <CheckSquare size={24} color="#9CA3AF" />
                                    <p>No subtasks yet</p>
                                    <button className="btn-secondary btn-small" onClick={() => setIsAddingSubtask(true)}>Add Subtask</button>
                                </div>
                            ) : (
                                <div className="subtasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                                    {subtasks.map(subtask => (
                                        <div key={subtask.id} className="subtask-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={subtask.completed} 
                                                    onChange={(e) => handleToggleSubtask(subtask.id, e.target.checked)}
                                                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                                                />
                                                <span style={{ 
                                                    fontSize: '14px', 
                                                    color: subtask.completed ? '#9CA3AF' : '#374151',
                                                    textDecoration: subtask.completed ? 'line-through' : 'none'
                                                }}>
                                                    {subtask.title}
                                                </span>
                                            </div>
                                            <button className="btn-icon" onClick={() => handleDeleteSubtask(subtask.id)}>
                                                <X size={16} color="#9CA3AF" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {isAddingSubtask && (
                                        <div className="add-subtask-form" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <input 
                                                type="text" 
                                                value={newSubtaskTitle}
                                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                placeholder="What needs to be done?"
                                                className="comment-input"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddSubtask();
                                                    if (e.key === 'Escape') {
                                                        setIsAddingSubtask(false);
                                                        setNewSubtaskTitle('');
                                                    }
                                                }}
                                            />
                                            <button className="btn-primary btn-small" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>Add</button>
                                            <button className="btn-secondary btn-small" onClick={() => {
                                                setIsAddingSubtask(false);
                                                setNewSubtaskTitle('');
                                            }}>Cancel</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="task-section">
                        <h3>Attachments ({attachments.length})</h3>
                        
                        {attachments.length > 0 && (
                            <div className="attachments-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                {attachments.map((file, index) => {
                                    return (
                                        <div key={file.id || index} className="attachment-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F3F4F6', borderRadius: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                <FileText size={16} color="#4B5563" />
                                                <span style={{ fontSize: '14px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <a href={`http://localhost:8080/api/files/download?fileName=${file.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Download">
                                                    <Download size={16} color="#3B82F6" />
                                                </a>
                                                <button className="btn-icon" title="Delete" onClick={() => handleRemoveAttachment(file.id)}>
                                                    <X size={16} color="#EF4444" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="task-attachments">
                            <FileUpload 
                                projectId={projectId} 
                                onUploadSuccess={handleUploadSuccess}
                                onUploadError={(error) => {
                                    console.error("Failed to upload file:", error);
                                }}
                            />
                        </div>
                    </div>
                    
                    <div className="task-section">
                        <h3>Comments</h3>
                        {comments.length === 0 ? (
                            <div className="task-comments empty-state">
                                <MessageSquare size={24} color="#9CA3AF" />
                                <p>No comments yet. Start the discussion!</p>
                            </div>
                        ) : (
                            <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-item" style={{ display: 'flex', gap: '12px' }}>
                                        <div className="comment-avatar-wrap">
                                            <img src={getAvatarUrl(comment.authorAvatarUrl, comment.authorName || 'U')} alt={comment.authorName} className="comment-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        </div>
                                        <div className="comment-content" style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                    <span style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>{comment.authorName || 'User'}</span>
                                                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <button className="btn-icon-small" onClick={() => handleDeleteComment(comment.id)} title="Delete comment">
                                                    <X size={14} color="#9CA3AF" />
                                                </button>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '14px', color: '#4B5563', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="comment-input-box" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', backgroundColor: 'transparent', padding: 0, border: 'none' }}>
                            <textarea 
                                placeholder="Write a comment..." 
                                className="comment-input" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                style={{ flex: 1, minHeight: '40px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', resize: 'vertical' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <button 
                                className="btn-primary btn-small" 
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                style={{ padding: '8px 16px', alignSelf: 'flex-end', height: '40px' }}
                            >
                                Send
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default TaskDetailsDrawer;
