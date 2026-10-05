import React, { useState } from 'react';
import { X } from 'lucide-react';
import './CreateMilestoneModal.css';

const CreateMilestoneModal = ({ isOpen, onClose, onSave, projectId }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !dueDate) {
            alert("Please fill in the required fields (Title and Due Date).");
            return;
        }

        const milestoneData = {
            title: title.trim(),
            dueDate: new Date(dueDate).toISOString(),
            description: description.trim()
        };

        if (onSave) {
            onSave(milestoneData);
        }

        // Reset and close
        setTitle('');
        setDueDate('');
        setDescription('');
        onClose();
    };

    return (
        <div className="cmm-overlay" onClick={onClose}>
            <div className="cmm-modal" onClick={e => e.stopPropagation()}>
                <div className="cmm-header">
                    <h2>Add Milestone</h2>
                    <button className="cmm-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="cmm-body">
                        <div className="cmm-form-group">
                            <label>Title <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                                type="text"
                                className="cmm-input"
                                placeholder="e.g. Beta Release"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="cmm-form-group">
                            <label>Due Date <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                                type="date"
                                className="cmm-input"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="cmm-form-group">
                            <label>Description</label>
                            <textarea
                                className="cmm-input cmm-textarea"
                                placeholder="What needs to be achieved by this milestone?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="cmm-footer">
                        <button type="button" className="cmm-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="cmm-btn-submit">
                            Create Milestone
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMilestoneModal;
