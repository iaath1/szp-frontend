import React, { useState, useEffect, useRef } from 'react';
import ProgressChart from '../../Dashboard/components/ProgressChart.jsx';
import StatusChart from '../../Dashboard/components/StatusChart.jsx';
import UpcomingTasks from '../../Dashboard/components/UpcomingTasks.jsx';
import TeamWorkload from '../../Dashboard/components/TeamWorkload.jsx';
import RecentActivity from '../../Dashboard/components/RecentActivity.jsx';
import './OverviewTab.css';
import { MoreVertical, Plus, Upload, FileText, Download, Calendar as CalendarIcon, Clock, Link as LinkIcon, CheckCircle2, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { getAvatarUrl } from '../../../utils/avatar.js';
import { navigate } from '../../../router/Router.jsx';
import CreateMilestoneModal from '../components/CreateMilestoneModal.jsx';
import projects from '../../../api/projects.js';
import TagBadge from '../../../components/ui/TagBadge/TagBadge.jsx';

const TEAM_MEMBERS = [
    { id: 1, name: 'Misha Stozhkov', role: 'Project Manager', isOwner: true },
    { id: 2, name: 'Anna Smith', role: 'Frontend Developer' },
    { id: 3, name: 'John Doe', role: 'Backend Developer' },
    { id: 4, name: 'Emily Johnson', role: 'UI/UX Designer' },
    { id: 5, name: 'Mike Johnson', role: 'QA Engineer' },
];

const getMemberRole = (m) => {
    const role = m.role || m.projectRole || m.memberRole || (m.user && m.user.role) || (m.user && m.user.projectRole);
    if (role && typeof role === 'object') return role.name || 'Member';
    if (role && typeof role === 'string') {
        return role.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    return 'Member';
};

const getMemberName = (m) => {
    if (m.user && m.user.name) return `${m.user.name} ${m.user.surname || ''}`.trim();
    return m.name || 'Unknown User';
};

const getMemberAvatar = (m, name) => {
    let path = null;
    if (m.user && m.user.avatarUrl) path = m.user.avatarUrl;
    else if (m.avatarUrl) path = m.avatarUrl;
    
    return getAvatarUrl(path, name);
};

const OverviewTab = ({ tasksStats, members, upcomingTasks, tasks, projectId, projectTags = [], projectFiles = [], milestones = [], refreshFiles, refreshMilestones }) => {
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

    // File state
    const fileInputRef = useRef(null);

    // Tags state
    const [tags, setTags] = useState(projectTags);
    const [isAddTagOpen, setIsAddTagOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3B82F6');

    useEffect(() => {
        setTags(projectTags);
    }, [projectTags]);

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const newTag = await projects.createProjectTag(projectId, { name: newTagName, colorHex: newTagColor });
            setTags([...tags, newTag]);
            setNewTagName('');
            setIsAddTagOpen(false);
        } catch (error) {
            console.error("Failed to create tag", error);
        }
    };

    const handleDeleteTag = async (tagId) => {
        try {
            await projects.deleteProjectTag(projectId, tagId);
            setTags(tags.filter(t => t.id !== tagId));
        } catch (error) {
            console.error("Failed to delete tag", error);
        }
    };



    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await projects.uploadProjectFile(projectId, formData);
            if (refreshFiles) refreshFiles();
        } catch (error) {
            console.error("Failed to upload file", error);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // reset input
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleCreateMilestone = async (data) => {
        try {
            await projects.createProjectMilestone(projectId, data);
            setIsMilestoneModalOpen(false);
            if (refreshMilestones) refreshMilestones();
        } catch (error) {
            console.error("Failed to create milestone", error);
        }
    };

    // Mock data for StatusChart

    return (
        <div className="overview-tab">
            <div className="ot-main">
                <div className="ot-charts-row">
                    <div className="ot-card">
                        <ProgressChart projectId={projectId} />
                    </div>
                    <div className="ot-card">
                        <StatusChart statuses={tasksStats} />
                    </div>
                </div>

                <div className="ot-lists-row">
                    <div className="ot-card">
                        <UpcomingTasks upcomingTasks={upcomingTasks} />
                    </div>
                    <div className="ot-card">
                        <TeamWorkload members={members} tasks={tasks} />
                    </div>
                </div>

                <div className="ot-card" style={{ marginTop: '24px', marginBottom: '24px' }}>
                    <RecentActivity tasks={tasks} files={projectFiles} />
                </div>

                <div className="ot-card milestones-card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h3 className="card-title">Milestones</h3>
                            <button
                                onClick={() => setIsMilestoneModalOpen(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    background: 'var(--bg-accent-light)', color: 'var(--accent-color)', border: 'none',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem',
                                    fontWeight: '500', cursor: 'pointer'
                                }}
                            >
                                <Plus size={12} /> Add
                            </button>
                        </div>
                        <a href="#" className="card-link">View all</a>
                    </div>
                    <div className="milestones-timeline">
                        {milestones.length === 0 ? (
                            <div style={{ padding: '16px 0', color: '#6B7280', fontSize: '0.875rem' }}>No milestones created yet.</div>
                        ) : (
                            milestones.map((ms, index) => {
                                const isCompleted = ms.status === 'COMPLETED' || ms.status === 'ACHIEVED';
                                const isMissed = ms.status === 'MISSED';
                                const isUpcoming = ms.status === 'PENDING';

                                let statusClass = 'upcoming';
                                if (isCompleted) statusClass = 'completed';
                                else if (isMissed) statusClass = 'missed'; // You can add missed CSS later
                                else statusClass = 'in-progress'; // Treat PENDING as in-progress for visuals if it's not upcoming. Actually let's just do upcoming/completed.

                                return (
                                    <div key={ms.id} className={`milestone ${isCompleted ? 'completed' : 'upcoming'}`}>
                                        <div className="ms-marker">
                                            {isCompleted ? <span className="ms-check">✓</span> : index + 1}
                                        </div>
                                        <div className="ms-details">
                                            <h4>{ms.title}</h4>
                                            <span>
                                                {ms.dueDate ? new Date(ms.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div className="ms-line"></div>
                    </div>
                </div>
            </div>

            <div className="ot-sidebar">
                {/* Team Members */}
                <div className="ot-card ot-widget">
                    <div className="card-header">
                        <h3 className="card-title">Team Members</h3>
                        <a href="#" className="card-link">View all</a>
                    </div>
                    <div className="team-list">
                        {members?.map((member, i) => {
                            const name = getMemberName(member);
                            const role = getMemberRole(member);
                            const avatar = getMemberAvatar(member, name);
                            const isOwner = member.isOwner || (role.toLowerCase().includes('manager'));

                            return (
                                <div key={member.id || i} className="team-member-item">
                                    <img src={avatar} alt={name} className="member-avatar" />
                                    <div className="member-info">
                                        <div className="member-name-row">
                                            <span className="member-name">{name}</span>
                                            {isOwner && <span className="member-badge">Owner</span>}
                                        </div>
                                        <span className="member-role">{role}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="btn-secondary w-full mt-16" onClick={() => navigate(`/projects/${projectId}/invite`)}>+ Invite Member</button>
                </div>

                {/* Project Files */}
                <div className="ot-card ot-widget">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h3 className="card-title">Project Files</h3>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    background: 'var(--bg-accent-light)', color: 'var(--accent-color)', border: 'none',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem',
                                    fontWeight: '500', cursor: 'pointer'
                                }}
                            >
                                <Upload size={12} /> Upload
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileUpload}
                            />
                        </div>
                        <a href="#" className="card-link">View all</a>
                    </div>
                    <div className="files-list">
                        {projectFiles.length === 0 ? (
                            <div style={{ padding: '16px 0', color: '#6B7280', fontSize: '0.875rem' }}>No files uploaded yet.</div>
                        ) : (
                            projectFiles.map((file, i) => {
                                const ext = file.name ? file.name.split('.').pop().toUpperCase() : 'FILE';
                                return (
                                    <div key={file.id || i} className="file-item">
                                        <div className="file-icon" style={{ backgroundColor: 'var(--bg-accent-light)', color: 'var(--accent-color)' }}>
                                            <FileText size={20} />
                                        </div>
                                        <div className="file-info">
                                            <span className="file-name" title={file.name}>
                                                {file.name && file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name}
                                            </span>
                                            <span className="file-meta">{ext} • {formatBytes(file.size)}</span>
                                        </div>
                                        <a href={`http://localhost:8080/api/files/download?fileName=${file.fileUrl}`} download target="_blank" rel="noreferrer" className="btn-icon-small" style={{ color: '#6B7280' }}>
                                            <Download size={16} />
                                        </a>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Project Tags */}
                <div className="ot-card ot-widget" style={{ overflow: 'visible' }}>
                    <div className="card-header">
                        <h3 className="card-title">Project Tags</h3>
                    </div>
                    <div className="tags-list" style={{ position: 'relative', flexWrap: 'wrap', display: 'flex', gap: '8px' }}>
                        {tags.map(tag => (
                            <TagBadge key={tag.id} tag={tag} onDelete={handleDeleteTag} />
                        ))}
                        
                        <div style={{ position: 'relative' }}>
                            <button className="tag-add" onClick={() => setIsAddTagOpen(!isAddTagOpen)}>+</button>
                            {isAddTagOpen && (
                                <div style={{ 
                                    position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                                    background: 'white', padding: '12px', borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10,
                                    display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px'
                                }}>
                                    <input 
                                        type="text" 
                                        placeholder="Tag name" 
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}
                                        autoFocus
                                    />
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input 
                                            type="color" 
                                            value={newTagColor}
                                            onChange={(e) => setNewTagColor(e.target.value)}
                                            style={{ padding: 0, border: 'none', width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }}
                                        />
                                        <span style={{ fontSize: '12px', color: '#666' }}>Pick color</span>
                                    </div>
                                    <button 
                                        onClick={handleCreateTag}
                                        disabled={!newTagName.trim()}
                                        style={{ 
                                            background: 'var(--accent-color)', color: 'white', border: 'none', 
                                            padding: '6px', borderRadius: '4px', cursor: 'pointer', 
                                            marginTop: '4px', fontSize: '13px', opacity: !newTagName.trim() ? 0.5 : 1
                                        }}
                                    >
                                        Save Tag
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CreateMilestoneModal
                isOpen={isMilestoneModalOpen}
                onClose={() => setIsMilestoneModalOpen(false)}
                onSave={handleCreateMilestone}
                projectId={projectId}
            />
        </div>
    );
};

export default OverviewTab;
