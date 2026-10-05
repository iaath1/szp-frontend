import { useState, useEffect } from 'react';
import {
    ChevronDown, Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, Link, Image as ImageIcon, Smile,
    MessageSquare, UploadCloud, Flag, CheckCircle2, Trash2, Check, Info, Lock, Globe, UserPlus
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import { navigate } from "../../router/Router.jsx";
import projects from "../../api/projects.js";
import { getProjectKey } from "../../utils/taskUtils.js";
import { getAvatarUrl } from "../../utils/avatar.js";
import './EditProject.css';

const EditProject = ({ params }) => {
    const projectId = params?.id;
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        key: '',
        description: '',
        projectKey: '',
        startAt: '',
        deadlineAt: '',
        isPrivate: true,
        status: "IN_PROGRESS",
        allowMembersInvite: true,
        enableTaskComments: true,
        allowFileUploads: true,
        publicLinkEnabled: false,
        projectTemplate: 'SOFTWARE_DEVELOPMENT',
        defaultTaskStatus: 'TODO'
    });

    useEffect(() => {
        if (!projectId) return;

        const fetchProjectDetails = async () => {
            try {
                const data = await projects.getProjectInfo(projectId);
                setProject(data);

                // Pre-fill form
                setFormData({
                    title: data.title || '',
                    key: data.projectKey || getProjectKey(data.title) || '',
                    projectKey: data.projectKey || getProjectKey(data.title) || '',
                    description: data.description || '',
                    startAt: data.startAt ? new Date(data.startAt).toISOString().split('T')[0] : '',
                    deadlineAt: data.deadlineAt ? new Date(data.deadlineAt).toISOString().split('T')[0] : '',
                    isPrivate: data.isPrivate !== undefined ? data.isPrivate : true,
                    status: data.status || "IN_PROGRESS",
                    allowMembersInvite: data.allowMembersInvite !== undefined ? data.allowMembersInvite : true,
                    enableTaskComments: data.enableTaskComments !== undefined ? data.enableTaskComments : true,
                    allowFileUploads: data.allowFileUploads !== undefined ? data.allowFileUploads : true,
                    publicLinkEnabled: data.publicLinkEnabled !== undefined ? data.publicLinkEnabled : false,
                    projectTemplate: data.projectTemplate || 'SOFTWARE_DEVELOPMENT',
                    defaultTaskStatus: data.defaultTaskStatus || 'TODO'
                });
            } catch (error) {
                console.error("Error fetching project details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    const generateKey = (title) => {
        if (!title) return '';
        const words = title.trim().split(/\s+/);
        if (words.length > 1) {
            return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
        }
        return title.substring(0, 3).toUpperCase();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'title') {
                const oldGenerated = generateKey(prev.title);
                if (!prev.projectKey || prev.projectKey === oldGenerated) {
                    newData.projectKey = generateKey(value);
                }
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.startAt && formData.deadlineAt) {
            if (new Date(formData.deadlineAt) < new Date(formData.startAt)) {
                alert("Target Date cannot be earlier than Start Date.");
                return;
            }
        }

        const payload = {
            ...formData,
            tags: project?.tags || [],
            startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
            deadlineAt: formData.deadlineAt ? new Date(formData.deadlineAt).toISOString() : null
        };

        try {
            await projects.updateProject(projectId, payload);
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error("Failed to update project:", error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await projects.deleteProject(projectId);
                navigate('/projects');
            } catch (error) {
                console.error("Failed to delete project:", error);
                alert("Could not delete project.");
            }
        }
    };

    if (loading) return <div className="dashboard-layout"><Sidebar /><main className="dashboard-main"><div style={{ padding: '32px' }}>Loading...</div></main></div>;

    const displayKey = formData.projectKey || getProjectKey(formData.title);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header
                    title="Edit Project"
                    subtitle="Update your project information and settings."
                    onBack={() => navigate(`/projects/${projectId}`)}
                    breadcrumbs={[
                        { label: 'Projects', onClick: () => navigate('/projects') },
                        { label: formData.title || 'Project', onClick: () => navigate(`/projects/${projectId}`) },
                        { label: 'Edit Project' }
                    ]}
                />

                <div className="edit-project-content">
                    <form className="edit-project-grid" onSubmit={handleSubmit}>
                        {/* Left Column */}
                        <div className="ep-left-col">
                            <div className="ep-form-container">
                                <div className="ep-form-row">
                                    <div className="ep-form-group">
                                        <label>Project Name <span className="required">*</span></label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="ep-input" />
                                    </div>
                                    <div className="ep-form-group">
                                        <label>Project Key <span className="required">*</span></label>
                                        <input type="text" name="projectKey" value={formData.projectKey} onChange={handleChange} className="ep-input" />
                                        <div className="ep-input-subtext">Short, unique key for your project (2-10 characters).</div>
                                    </div>
                                </div>

                                <div className="ep-form-group" style={{ marginBottom: '24px' }}>
                                    <label>Description</label>
                                    <div className="ep-textarea-container">
                                        <div className="ep-textarea-toolbar">
                                            <span>Normal</span>
                                            <ChevronDown size={14} style={{ marginRight: '8px' }} />
                                            <Bold size={16} />
                                            <Italic size={16} />
                                            <Underline size={16} />
                                            <Strikethrough size={16} />
                                            <Code size={16} />
                                            <List size={16} style={{ marginLeft: '8px' }} />
                                            <ListOrdered size={16} />
                                            <Link size={16} style={{ marginLeft: '8px' }} />
                                            <ImageIcon size={16} />
                                            <Smile size={16} />
                                        </div>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="ep-textarea"
                                            placeholder="Redesign and develop the new corporate website..."
                                        ></textarea>
                                        <div className="ep-textarea-footer">
                                            {formData.description.length} / 2000
                                        </div>
                                    </div>
                                </div>

                                <div className="ep-form-row">
                                    <div className="ep-form-group">
                                        <label>Project Template</label>
                                        <div className="ep-input-with-icon">
                                            <Code size={16} className="input-icon" style={{ opacity: 0.5 }} />
                                            <select
                                                name="projectTemplate"
                                                value={formData.projectTemplate}
                                                className="ep-select ep-input"
                                                disabled
                                                style={{ cursor: 'not-allowed', opacity: 0.6, backgroundColor: 'var(--bg-secondary, #F3F4F6)' }}
                                            >
                                                <option value="">No template</option>
                                                <option value="SOFTWARE_DEVELOPMENT">💻 Software Development</option>
                                                <option value="MARKETING_CAMPAIGN">📣 Marketing Campaign</option>
                                                <option value="DESIGN_PROJECT">🎨 Design Project</option>
                                            </select>
                                        </div>
                                        <div className="ep-input-subtext">Template can only be set when creating a project.</div>
                                    </div>
                                    <div className="ep-form-group">
                                        <label>Visibility</label>
                                        <div className="ep-input-with-icon">
                                            <Lock size={16} className="input-icon" style={{ opacity: 0.5 }} />
                                            <select name="isPrivate" value={formData.isPrivate} onChange={handleChange} className="ep-select ep-input">
                                                <option value="true">Team</option>
                                                <option value="false">Public</option>
                                            </select>
                                        </div>
                                        <div className="ep-input-subtext">Only invited members can access this project.</div>
                                    </div>
                                </div>

                                <div className="ep-form-row">
                                    <div className="ep-form-group">
                                        <label>Start Date</label>
                                        <input type="date" name="startAt" value={formData.startAt} onChange={handleChange} className="ep-input" />
                                    </div>
                                    <div className="ep-form-group">
                                        <label>Target Date</label>
                                        <input type="date" name="deadlineAt" value={formData.deadlineAt} onChange={handleChange} className="ep-input" />
                                        <div className="ep-input-subtext">Optional, you can change it later.</div>
                                    </div>
                                </div>

                                <div className="ep-form-row">
                                    <div className="ep-form-group">
                                        <label>Project Owner</label>
                                        <div className="ep-owner-dropdown">
                                            <div className="ep-owner-select" style={{ backgroundColor: '#F3F4F6', cursor: 'not-allowed', borderColor: '#E5E7EB' }}>
                                                <div className="ep-owner-info" style={{ opacity: 0.7 }}>
                                                    <img src={getAvatarUrl(project?.owner?.avatarUrl, `${project?.owner?.name} ${project?.owner?.surname}`)} alt="owner" className="ep-owner-avatar" />
                                                    <span className="ep-owner-name" style={{ color: '#9CA3AF' }}>{project?.owner ? `${project.owner.name} ${project.owner.surname}` : 'Unknown Owner'}</span>
                                                </div>
                                                <Lock size={14} color="#9CA3AF" />
                                            </div>
                                        </div>
                                        <div className="ep-input-subtext">The owner has full control over the project.</div>
                                    </div>
                                    <div className="ep-form-group">
                                        <label>Default Task Status</label>
                                        <div className="ep-input-with-icon">
                                            <div className="input-icon" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#9CA3AF', left: 16 }}></div>
                                            <select name="defaultTaskStatus" value={formData.defaultTaskStatus} onChange={handleChange} className="ep-select ep-input" style={{ paddingLeft: '32px' }}>
                                                <option value="TODO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="REVIEW">Review</option>
                                            </select>
                                        </div>
                                        <div className="ep-input-subtext">Select the default status for new tasks.</div>
                                    </div>
                                </div>

                                <div className="ep-form-row">
                                    <div className="ep-form-group">
                                        <label>Project Status</label>
                                        <div className="ep-input-with-icon">
                                            <div className="input-icon" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: formData.status === 'COMPLETED' ? '#10B981' : formData.status === 'ON_HOLD' ? '#F59E0B' : '#3B82F6', left: 16 }}></div>
                                            <select name="status" value={formData.status} onChange={handleChange} className="ep-select ep-input" style={{ paddingLeft: '32px' }}>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="ON_HOLD">On Hold</option>
                                            </select>
                                        </div>
                                        <div className="ep-input-subtext">Current status of the project.</div>
                                    </div>
                                </div>



                                <div className="ep-actions-footer">
                                    <button type="button" className="ep-btn-cancel" onClick={() => navigate(`/projects/${projectId}`)}>Cancel</button>
                                    <div className="ep-footer-btns">
                                        <button type="button" className="ep-btn-delete" onClick={handleDelete}>
                                            <Trash2 size={16} /> Delete Project
                                        </button>
                                        <button type="submit" className="ep-btn-save">
                                            <Check size={16} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                                <div className="ep-footer-info" style={{ marginTop: '16px' }}>
                                    <Info size={14} />
                                    Changes you make here will affect the entire project. Make sure to review all settings before saving.
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="ep-right-col">

                            <div className="ep-card-title">Project Preview</div>
                            <div className="ep-preview-card">
                                <div className="ep-preview-content">
                                    <div className="ep-preview-header">
                                        <div className="ep-preview-icon">
                                            <Globe size={24} />
                                        </div>
                                        <div className="ep-preview-info">
                                            <h4>
                                                {formData.title || 'Project Name'}
                                                <span className={`ep-status-badge active`} style={{
                                                    backgroundColor: formData.status === 'COMPLETED' ? '#D1FAE5' : formData.status === 'ON_HOLD' ? 'var(--bg-warning-light)' : '#DBEAFE',
                                                    color: formData.status === 'COMPLETED' ? '#059669' : formData.status === 'ON_HOLD' ? '#D97706' : '#2563EB'
                                                }}>
                                                    {formData.status === 'IN_PROGRESS' ? 'In Progress' : formData.status === 'ON_HOLD' ? 'On Hold' : 'Completed'}
                                                </span>
                                            </h4>
                                            <div className="ep-preview-meta">
                                                {displayKey || 'KEY'} • Created on {project?.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 24, 2024'}
                                            </div>
                                            <div className="ep-preview-desc">
                                                {formData.description ? (formData.description.substring(0, 100) + (formData.description.length > 100 ? '...' : '')) : 'No description provided.'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ep-preview-stats">
                                        <div className="ep-preview-stat">
                                            <div className="ep-preview-stat-icon blue"><UserPlus size={18} /></div>
                                            <div className="ep-preview-stat-value">
                                                <span>{project.membersCount}</span>
                                                <span>Members</span>
                                            </div>
                                        </div>
                                        <div className="ep-preview-stat">
                                            <div className="ep-preview-stat-icon red"><Flag size={18} /></div>
                                            <div className="ep-preview-stat-value">
                                                <span>{project.tasksCount}</span>
                                                <span>Tasks</span>
                                            </div>
                                        </div>
                                        <div className="ep-preview-stat">
                                            <div className="ep-preview-stat-icon green"><CheckCircle2 size={18} /></div>
                                            <div className="ep-preview-stat-value">
                                                <span>{project.progress || 0}%</span>
                                                <span>Progress</span>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.deadlineAt && (
                                        <div className="ep-preview-stat" style={{ marginTop: '8px' }}>
                                            <div className="ep-preview-stat-icon" style={{ color: '#6B7280' }}><Info size={16} /></div>
                                            <div className="ep-preview-stat-value">
                                                <span style={{ fontSize: '0.8rem' }}>{new Date(formData.deadlineAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span>Target Date</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ep-card-title">Project Settings</div>
                            <div className="ep-settings-card">
                                <div className="ep-setting-item" onClick={() => setFormData(prev => ({...prev, allowMembersInvite: !prev.allowMembersInvite}))} style={{ cursor: 'pointer' }}>
                                    <div className="ep-setting-info">
                                        <MessageSquare size={16} className="ep-setting-icon" />
                                        <div className="ep-setting-text">
                                            <span>Allow members to invite others</span>
                                            <span>Team members can invite new people</span>
                                        </div>
                                    </div>
                                    <div className={`ep-switch ${formData.allowMembersInvite ? 'on' : ''}`}><div className="ep-switch-handle"></div></div>
                                </div>
                                <div className="ep-setting-item" onClick={() => setFormData(prev => ({...prev, enableTaskComments: !prev.enableTaskComments}))} style={{ cursor: 'pointer' }}>
                                    <div className="ep-setting-info">
                                        <MessageSquare size={16} className="ep-setting-icon" />
                                        <div className="ep-setting-text">
                                            <span>Enable task comments</span>
                                            <span>Allow comments on tasks and files</span>
                                        </div>
                                    </div>
                                    <div className={`ep-switch ${formData.enableTaskComments ? 'on' : ''}`}><div className="ep-switch-handle"></div></div>
                                </div>
                                <div className="ep-setting-item" onClick={() => setFormData(prev => ({...prev, allowFileUploads: !prev.allowFileUploads}))} style={{ cursor: 'pointer' }}>
                                    <div className="ep-setting-info">
                                        <UploadCloud size={16} className="ep-setting-icon" />
                                        <div className="ep-setting-text">
                                            <span>Allow file uploads</span>
                                            <span>Team members can upload files</span>
                                        </div>
                                    </div>
                                    <div className={`ep-switch ${formData.allowFileUploads ? 'on' : ''}`}><div className="ep-switch-handle"></div></div>
                                </div>
                                <div className="ep-setting-item" onClick={() => setFormData(prev => ({...prev, publicLinkEnabled: !prev.publicLinkEnabled}))} style={{ cursor: 'pointer' }}>
                                    <div className="ep-setting-info">
                                        <Link size={16} className="ep-setting-icon" />
                                        <div className="ep-setting-text">
                                            <span>Public link</span>
                                            <span>Anyone with the link can view</span>
                                        </div>
                                    </div>
                                    <div className={`ep-switch ${formData.publicLinkEnabled ? 'on' : ''}`}><div className="ep-switch-handle"></div></div>
                                </div>
                            </div>

                            <div className="ep-card-title" style={{ color: '#EF4444' }}>Danger Zone</div>
                            <div className="ep-danger-card">
                                <div className="ep-danger-desc">
                                    Be careful! This action cannot be undone.
                                </div>
                                <button type="button" className="ep-btn-delete-outline" onClick={handleDelete}>
                                    <Trash2 size={16} /> Delete Project
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditProject;
