import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, MessageSquare, Paperclip, Filter, AlertCircle, Edit3 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { jwtDecode } from "jwt-decode";
import { getAvatarUrl } from '../../../utils/avatar.js';
import { navigate } from '../../../router/Router.jsx';
import tasksApi from '../../../api/tasks.js';
import './BoardTab.css';

const COLUMNS = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'REVIEW', title: 'Review' },
    { id: 'DONE', title: 'Done' }
];

const BoardTab = ({ tasks, projectId, onTaskClick }) => {
    const [boardData, setBoardData] = useState({
        TODO: [],
        IN_PROGRESS: [],
        REVIEW: [],
        DONE: []
    });
    const [filterMyTasks, setFilterMyTasks] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserEmail(decoded.sub); // Assuming sub is email
            } catch (error) {
                console.error("Token decode error:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (!tasks) return;
        
        const newBoardData = {
            TODO: [],
            IN_PROGRESS: [],
            REVIEW: [],
            DONE: []
        };

        tasks.forEach(task => {
            const statusKey = task.status || 'TODO';
            if (newBoardData[statusKey]) {
                newBoardData[statusKey].push(task);
            } else if (newBoardData[statusKey.toUpperCase()]) {
                 newBoardData[statusKey.toUpperCase()].push(task);
            } else if (statusKey === 'To Do') {
                newBoardData.TODO.push(task);
            } else if (statusKey === 'In Progress') {
                newBoardData.IN_PROGRESS.push(task);
            } else {
                 newBoardData.TODO.push(task); // Fallback
            }
        });

        setBoardData(newBoardData);
    }, [tasks]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceCol = source.droppableId;
        const destCol = destination.droppableId;

        const sourceList = Array.from(boardData[sourceCol]);
        const destList = Array.from(boardData[destCol]);

        const draggedTask = sourceList[source.index];

        sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, draggedTask);

        setBoardData(prev => ({
            ...prev,
            [sourceCol]: sourceList,
            [destCol]: destList
        }));

        try {
            await tasksApi.updateTaskStatus(draggedTask.id, destCol);
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const getFilteredTasks = (columnId) => {
        const colTasks = boardData[columnId] || [];
        if (!filterMyTasks || !currentUserEmail) return colTasks;
        
        return colTasks.filter(task => {
            if (!task.assignee) return false;
            if (typeof task.assignee === 'string') return task.assignee === currentUserEmail;
            return task.assignee.email === currentUserEmail;
        });
    };

    return (
        <div className="board-tab">
            <div className="board-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '16px' }}>
                <button 
                    className={`btn-secondary ${filterMyTasks ? 'active-filter' : ''}`}
                    onClick={() => setFilterMyTasks(!filterMyTasks)}
                    style={{ backgroundColor: filterMyTasks ? 'var(--bg-accent-light)' : 'white', color: filterMyTasks ? 'var(--accent-color)' : '#4B5563', borderColor: filterMyTasks ? 'var(--accent-color)' : '#E5E7EB' }}
                >
                    <Filter size={16} /> Only My Tasks
                </button>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="board-scroll-container">
                    {COLUMNS.map(column => (
                        <Droppable key={column.id} droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div 
                                    className="board-column"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{ 
                                        backgroundColor: snapshot.isDraggingOver ? '#F9FAFB' : 'transparent',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                >
                                    <div className="board-column-header">
                                        <div className="bch-left">
                                            <h3>{column.title}</h3>
                                            <span className="bch-count">{getFilteredTasks(column.id).length}</span>
                                        </div>
                                        <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
                                    </div>
                                    <div className="board-cards" style={{ minHeight: '150px' }}>
                                        {getFilteredTasks(column.id).map((card, index) => (
                                            <Draggable key={card.id.toString()} draggableId={card.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div 
                                                        className="board-card"
                                                        onClick={() => onTaskClick && onTaskClick(card)}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
                                                            transform: snapshot.isDragging ? provided.draggableProps.style.transform : 'none'
                                                        }}
                                                    >
                                                        <div className="bc-tags">
                                                            <span className="bc-tag" style={{ backgroundColor: 'var(--bg-accent-light)', color: 'var(--accent-color)' }}>
                                                                {card.priority || 'Task'}
                                                            </span>
                                                        </div>
                                                        <h4 className="bc-title">{card.title}</h4>
                                                        <div className="bc-footer">
                                                            {card.assignee ? (
                                                                <img src={getAvatarUrl(card.assignee?.avatarUrl, typeof card.assignee === 'string' ? card.assignee : card.assignee.email)} alt="assignee" className="bc-avatar" />
                                                            ) : (
                                                                <div className="bc-avatar" style={{ background: '#E5E7EB', width: 24, height: 24, borderRadius: '50%' }}></div>
                                                            )}
                                                            <div className="bc-meta">
                                                                <span className="bc-meta-item"><MessageSquare size={14} /> 0</span>
                                                                <span className="bc-meta-item"><Paperclip size={14} /> 0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        <button className="bc-add-btn" onClick={() => navigate(`/projects/${projectId}/tasks/new`)}>
                                            <Plus size={16} /> Add Task
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default BoardTab;
