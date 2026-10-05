import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, Lightbulb, X, Check } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import { navigate } from "../../router/Router.jsx";
import projects from "../../api/projects.js";
import users from "../../api/users.js";
import apiClient from "../../api/client.js";
import { getAvatarUrl } from '../../utils/avatar.js';
import './CreateProject.css';

const CreateProject = () => {
    const [me, setMe] = useState(null);
    const [projectMembers, setProjectMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const profile = await users.getProfile();
                setMe(profile);
                setProjectMembers([{
                    id: profile.id,
                    name: `${profile.name} ${profile.surname}`,
                    email: profile.email,
                    avatarUrl: profile.avatarUrl,
                    role: 'Owner',
                    badge: 'purple'
                }]);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchMe();
    }, []);

    useEffect(() => {
        const fetchSearch = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }
            setIsSearching(true);
            try {
                const res = await apiClient.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                const usersFound = res.data.filter(item => item.type === 'USER');
                setSearchResults(usersFound);
                setShowDropdown(true);
            } catch (err) {
                console.error("Error searching users", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const [formData, setFormData] = useState({
        title: '',
        key: '',
        description: '',
        projectKey: '',
        startAt: '',
        deadlineAt: '',
        isPrivate: true,
        status: "IN_PROGRESS",
        projectTemplate: '',
        defaultTaskStatus: 'TODO'
    })

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
            
            // Auto-suggest project key if title changes and user hasn't manually entered a totally different one
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
                alert("Target Deadline cannot be earlier than Start Date.");
                return;
            }
        }

        const payload = {
            ...formData,
            startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
            deadlineAt: formData.deadlineAt ? new Date(formData.deadlineAt).toISOString() : null
        };

        try {
            await projects.createProject(payload);
            navigate('/projects');
        } catch (error) {
            console.error("Failed to create project:", error);
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header
                    title="Create New Project"
                    subtitle="Fill in the details below to create your new project."
                    onBack={() => navigate('/projects')}
                />

                <div className="dashboard-content create-project-content">
                    <div className="create-project-grid">
                        {/* Left Column */}
                        <form className="cp-left-col" onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="cp-section">
                                <h3 className="cp-section-title">Basic Information</h3>


                                <div className="cp-form-row">
                                    <div className="cp-form-group">
                                        <label>Project Name <span className="required">*</span></label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter project name" className="cp-input" />
                                    </div>
                                    <div className="cp-form-group">
                                        <label>Project Key</label>
                                        <input
                                            type="text"
                                            name="projectKey"
                                            value={formData.projectKey}
                                            onChange={handleChange}
                                            placeholder="Enter short key (e.g. WEB)"
                                            className="cp-input"
                                        />
                                        <span className="cp-hint">Used for identification and in project URLs</span>
                                    </div>
                                </div>

                                <div className="cp-form-group mt-20">
                                    <label>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your project, its goals and objectives..." className="cp-textarea"></textarea>
                                    <div className="char-count">{formData.description.length} / 500</div>
                                </div>

                                <div className="cp-form-row mt-20">
                                    <div className="cp-form-group">
                                        <label>Start Date <span className="required">*</span></label>
                                        <div className="cp-input-with-icon">
                                            <input type="date" name="startAt" value={formData.startAt} onChange={handleChange} className="cp-input" />
                                        </div>
                                    </div>
                                    <div className="cp-form-group">
                                        <label>Target Deadline</label>
                                        <div className="cp-input-with-icon">
                                            <input type="date" name="deadlineAt" value={formData.deadlineAt} onChange={handleChange} className="cp-input" />
                                        </div>
                                    </div>
                                </div>

                                <div className="cp-form-row mt-20">
                                    <div className="cp-form-group">
                                        <label>Project Template</label>
                                        <select name="projectTemplate" value={formData.projectTemplate} onChange={handleChange} className="cp-select">
                                            <option value="">No template</option>
                                            <option value="SOFTWARE_DEVELOPMENT">💻 Software Development</option>
                                            <option value="MARKETING_CAMPAIGN">📣 Marketing Campaign</option>
                                            <option value="DESIGN_PROJECT">🎨 Design Project</option>
                                        </select>
                                        <span className="cp-hint">Automatically creates starter tasks for the project</span>
                                    </div>
                                    <div className="cp-form-group">
                                        <label>Default Task Status</label>
                                        <select name="defaultTaskStatus" value={formData.defaultTaskStatus} onChange={handleChange} className="cp-select">
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="REVIEW">Review</option>
                                        </select>
                                        <span className="cp-hint">Default status for new tasks in this project</span>
                                    </div>
                                </div>
                            </div>

                            {/* Project Settings */}
                            <div className="cp-section mt-30">
                                <h3 className="cp-section-title">Project Settings</h3>

                                <div className="cp-form-row">
                                    <div className="cp-form-group">
                                        <label>Privacy <span className="required">*</span></label>
                                        <select name="isPrivate" value={formData.isPrivate ? "private" : "public"} onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.value === "private" }))} className="cp-select">
                                            <option value="private">Private</option>
                                            <option value="public">Public</option>
                                        </select>
                                        <span className="cp-hint">Only invited members can access</span>
                                    </div>
                                    <div className="cp-form-group">
                                        <label>Default View</label>
                                        <select className="cp-select" disabled>
                                            <option value="board">Board (Kanban)</option>
                                            <option value="list">List View</option>
                                        </select>
                                        <span className="cp-hint">Choose a default view for this project</span>
                                    </div>
                                </div>

                                <div className="cp-form-group mt-20">
                                    <label>Task Status Workflow</label>
                                    <div className="workflow-steps">
                                        <div className="workflow-step">
                                            <span className="workflow-dot dot-todo"></span> To Do
                                        </div>
                                        <div className="workflow-arrow">{'>'}</div>
                                        <div className="workflow-step">
                                            <span className="workflow-dot dot-inprogress"></span> In Progress
                                        </div>
                                        <div className="workflow-arrow">{'>'}</div>
                                        <div className="workflow-step">
                                            <span className="workflow-dot dot-review"></span> Review
                                        </div>
                                        <div className="workflow-arrow">{'>'}</div>
                                        <div className="workflow-step">
                                            <span className="workflow-dot dot-done"></span> Done
                                        </div>
                                        <button className="workflow-add-btn">
                                            <Plus size={14} /> Add Status
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="cp-actions">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/projects')}>Cancel</button>
                                <button type="submit" className="btn-create">Create Project</button>
                            </div>
                        </form>

                        {/* Right Column */}
                        <div className="cp-right-col">
                            {/* Add Members */}
                            <div className="cp-section">
                                <h3 className="cp-section-title">Add Members</h3>
                                <p className="cp-section-desc">Invite members to your project</p>

                                <div className="search-member-container" style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or email..." 
                                        className="cp-input" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => {
                                            if (searchResults.length > 0) setShowDropdown(true);
                                        }}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    />
                                    
                                    {showDropdown && (
                                        <div className="search-dropdown">
                                            {isSearching ? (
                                                <div className="search-dropdown-item">Searching...</div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map(user => (
                                                    <div 
                                                        key={user.id} 
                                                        className="search-dropdown-item"
                                                        onClick={() => {
                                                            if (!projectMembers.find(m => m.id === user.id)) {
                                                                setProjectMembers(prev => [...prev, {
                                                                    id: user.id,
                                                                    name: user.title,
                                                                    email: user.subtitle,
                                                                    avatarUrl: null,
                                                                    role: 'Member',
                                                                    badge: 'blue'
                                                                }]);
                                                            }
                                                            setSearchQuery('');
                                                            setShowDropdown(false);
                                                        }}
                                                    >
                                                        <img src={getAvatarUrl(null, user.title)} alt={user.title} className="sd-avatar" />
                                                        <div className="sd-info">
                                                            <div className="sd-name">{user.title}</div>
                                                            <div className="sd-email">{user.subtitle}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="search-dropdown-item">No users found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="members-list">
                                    {projectMembers.map(member => (
                                        <div key={member.id} className="member-item">
                                            <div className="member-info">
                                                <img src={getAvatarUrl(member.avatarUrl, member.name)} alt={member.name} className="member-avatar" />
                                                <span className="member-name">{member.name}</span>
                                                {member.role && (
                                                    <span className={`member-role ${member.badge || ''}`}>{member.role}</span>
                                                )}
                                            </div>
                                            {member.role !== 'Owner' && (
                                                <button className="remove-member-btn" onClick={() => setProjectMembers(prev => prev.filter(m => m.id !== member.id))}><X size={16} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Project Image */}
                            <div className="cp-section mt-30">
                                <h3 className="cp-section-title">Project Image</h3>
                                <p className="cp-section-desc">Add an image to represent your project</p>

                                <div className="image-upload-area">
                                    <div className="upload-icon-wrapper">
                                        <ImageIcon size={24} style={{ color: 'var(--accent-color)' }} />
                                        <div className="plus-badge"><Plus size={12} color="white" /></div>
                                    </div>
                                    <div className="upload-text">Click to upload</div>
                                    <div className="upload-hint">PNG, JPG or SVG (max. 2MB)</div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="tips-box mt-30">
                                <div className="tips-header">
                                    <div className="tips-icon">
                                        <Lightbulb size={18} style={{ color: 'var(--accent-color)' }} />
                                    </div>
                                    <span className="tips-title">Tips</span>
                                </div>
                                <ul className="tips-list">
                                    <li>A clear name helps your team stay aligned.</li>
                                    <li>Add a description to keep everyone informed.</li>
                                    <li>You can change these settings later.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateProject;
