import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createEvent } from '../../../api/calendar';
import projectsApi from '../../../api/projects';
import './CreateEventModal.css';

const CreateEventModal = ({ onClose, onEventCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState('MEETING');
    const [projectId, setProjectId] = useState('');
    const [projects, setProjects] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectsApi.getProjects();
                setProjects(res || []);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            }
        };
        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createEvent({
                title,
                description,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                type,
                projectId: projectId ? parseInt(projectId) : null
            });
            onEventCreated();
            onClose();
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event. Please check the inputs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Event</h2>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input 
                            type="text" 
                            required 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Sprint Review"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional event description..."
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input 
                                type="datetime-local" 
                                required 
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input 
                                type="datetime-local" 
                                required 
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Event Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="MEETING">Meeting</option>
                                <option value="REMINDER">Reminder</option>
                                <option value="HOLIDAY">Holiday</option>
                                <option value="DEADLINE">Deadline</option>
                                <option value="GENERAL">General</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Project (Optional)</label>
                            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                                <option value="">No Project (Personal Event)</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.title || p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
