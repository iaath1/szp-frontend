import React from 'react';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, Tag } from 'lucide-react';
import './EventDetailsModal.css';

const EventDetailsModal = ({ event, onClose, onDelete }) => {
    if (!event) return null;

    const startDate = new Date(event.starTime);
    const endDate = new Date(event.endTime);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content event-details-content" onClick={e => e.stopPropagation()}>
                <div className={`modal-header event-header-${event.displayType?.toLowerCase() || 'general'}`}>
                    <div className="header-title-section">
                        <h2>{event.title}</h2>
                        <span className="event-type-badge">{event.displayType}</span>
                    </div>
                    <button className="icon-btn close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                
                <div className="event-details-body">
                    <div className="detail-row">
                        <CalendarIcon size={18} className="detail-icon" />
                        <div className="detail-text">
                            <strong>Date</strong>
                            <span>{formatDate(startDate)}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <Clock size={18} className="detail-icon" />
                        <div className="detail-text">
                            <strong>Time</strong>
                            <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
                        </div>
                    </div>

                    {event.sourceType && (
                        <div className="detail-row">
                            <Tag size={18} className="detail-icon" />
                            <div className="detail-text">
                                <strong>Context</strong>
                                <span>
                                    {event.projectName 
                                        ? `Project: ${event.projectName}` 
                                        : 'Personal Event'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="detail-row description-row">
                        <AlignLeft size={18} className="detail-icon" />
                        <div className="detail-text">
                            <strong>Description</strong>
                            <p>{event.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" style={{color: 'red', borderColor: 'red'}} onClick={() => window.confirm('Are you sure you want to delete this event?') && onDelete(event.id)}>Delete</button>
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
