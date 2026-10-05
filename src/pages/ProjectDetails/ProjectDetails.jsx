import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Link as LinkIcon, AlertCircle, ArrowLeft, MoreHorizontal, MessageSquare, Download, Settings, RefreshCcw, UserPlus, Edit3, Globe } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar.js';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import { navigate } from '../../router/Router.jsx';
import './ProjectDetails.css';
import projects from '../../api/projects.js';
import users from '../../api/users.js';
import { getProjectKey } from '../../utils/taskUtils.js';
import { formatStatus } from '../../utils/formatters.js';

// Tabs Components
import OverviewTab from './tabs/OverviewTab.jsx';
import TasksTab from './tabs/TasksTab.jsx';
import BoardTab from './tabs/BoardTab.jsx';
import TeamTab from './tabs/TeamTab.jsx';
import CalendarTab from './tabs/CalendarTab.jsx';
import FilesTab from './tabs/FilesTab.jsx';
import AnalyticsTab from './tabs/AnalyticsTab.jsx';
import PlaceholderTab from './tabs/PlaceholderTab.jsx';
import TaskDetailsDrawer from './components/TaskDetailsDrawer.jsx';

const ProjectDetails = ({ params }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [project, setProject] = useState(null);
    const [tasksStats, setTasksStats] = useState({});
    const [members, setMembers] = useState(null);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [projectFiles, setProjectFiles] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [me, setMe] = useState(null);

    // In a real app, you would fetch project details using params.id
    const projectId = params?.id || 1;

    const fetchProjectFiles = async () => {
        try {
            const files = await projects.getProjectFiles(projectId);
            setProjectFiles(files || []);
        } catch (error) {
            console.error("Error fetching project files:", error);
        }
    };

    const fetchMilestones = async () => {
        try {
            const fetchedMilestones = await projects.getProjectMilestones(projectId);
            setMilestones(fetchedMilestones || []);
        } catch (error) {
            console.error("Error fetching milestones:", error);
        }
    };

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const projectData = await projects.getProjectInfo(projectId);
                setProject(projectData);
                console.log("Fetched Project:", projectData);
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        };

        const fetchProjectTasksStats = async () => {
            try {
                const tasksStats = await projects.getProjectTasksStats(projectId);
                setTasksStats(tasksStats);
            } catch (error) {
                console.error("Error fetching project tasks stats:", error);
            }
        }

        const fetchProjectMembers = async () => {
            try {
                const fetchedMembers = await projects.getProjectMembers(projectId);
                setMembers(fetchedMembers);
                console.log("Fetched Members:", fetchedMembers);
            } catch (error) {
                console.error("Error fetching project members:", error);
            }
        }

        const fetchProjectUpcomingTasks = async () => {
            try {
                const fetchedTasks = await projects.getProjectUpcomingTasks(projectId);
                setUpcomingTasks(fetchedTasks);
                console.log("Fetched Upcoming Tasks:", fetchedTasks);
            } catch (error) {
                console.error("Error fetching project tasks:", error);
            }
        }

        const fetchProjectTasks = async () => {
            try {
                const fetchedTasks = await projects.getProjectTasks(projectId);
                setTasks(fetchedTasks);
                console.log("Fetched Tasks:", fetchedTasks);
            } catch (error) {
                console.error("Error fetching project tasks:", error);
            }
        }

        const fetchMe = async () => {
            try {
                const profile = await users.getProfile();
                setMe(profile);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProjectDetails();
        fetchProjectTasksStats();
        fetchProjectMembers();
        fetchProjectUpcomingTasks();
        fetchProjectTasks();
        fetchProjectFiles();
        fetchMilestones();
        fetchMe();
    }, [projectId]);

    const tabs = [
        'Overview', 'Tasks', 'Board', 'Calendar', 'Files', 'Team', 'Analytics'
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return <OverviewTab 
                    tasksStats={tasksStats} 
                    members={members} 
                    upcomingTasks={upcomingTasks} 
                    projectId={projectId} 
                    onTaskClick={setSelectedTask} 
                    projectTags={project?.tags || []}
                    projectFiles={projectFiles}
                    milestones={milestones}
                    tasks={tasks}
                    refreshFiles={fetchProjectFiles}
                    refreshMilestones={fetchMilestones}
                />;
            case 'Tasks':
                return <TasksTab tasks={tasks} projectId={projectId} projectKey={project.projectKey || getProjectKey(project.title)} onTaskClick={setSelectedTask} />;
            case 'Board':
                return <BoardTab tasks={tasks} projectId={projectId} onTaskClick={setSelectedTask} />;
            case 'Team':
                return <TeamTab members={members} projectId={projectId} />;
            case 'Calendar':
                return <CalendarTab tasks={tasks} milestones={milestones} onTaskClick={setSelectedTask} />;
            case 'Files':
                return <FilesTab projectFiles={projectFiles} projectId={projectId} refreshFiles={fetchProjectFiles} />;
            case 'Analytics':
                return <AnalyticsTab tasksStats={tasksStats} tasks={tasks} members={members} />;
        }
    };

    if (!project) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    <h2>Loading project details...</h2>
                </main>
            </div>
        );
    }

    const handleTaskUpdated = (updatedTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        if (selectedTask?.id === updatedTask.id) {
            setSelectedTask(updatedTask);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header
                    title="Website Redesign"
                    subtitle={<><ArrowLeft size={16} className="inline-icon" onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }} /> Back to Projects</>}
                    actions={
                        <div className="header-actions">
                            <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}/invite`)}>
                                <UserPlus size={16} /> Invite
                            </button>
                            <button className="btn-secondary"><Edit3 size={16} /> Edit Project</button>
                            <button className="btn-icon"><MoreHorizontal size={16} /></button>
                        </div>
                    }
                />

                <div className="project-details-content">
                    {/* Project Header Card */}
                    <div className="project-header-card">
                        <div className="ph-left">
                            <div className="ph-icon-large">
                                <Globe size={40} style={{ color: 'var(--accent-color)' }} />
                            </div>
                            <div className="ph-info">
                                <h2>{project.title} <span className="status-badge-active">{formatStatus(project.status)}</span></h2>
                                <p>{project.description}</p>
                                <div className="ph-progress-bar">
                                    <div className="ph-progress-fill" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="ph-right">
                            <div className="ph-meta-item">
                                <span className="ph-label">Project Key</span>
                                <span className="ph-value">{project.projectKey || getProjectKey(project.title)}</span>
                            </div>
                            <div className="ph-meta-item">
                                <span className="ph-label">Owner</span>
                                <span className="ph-value flex-align">
                                    <img src={getAvatarUrl(project.owner?.avatarUrl, `${project.owner?.name ?? ''} ${project.owner?.surname ?? ''}`)} alt="avatar" className="ph-avatar" /> 
                                    {project.owner ? `${project.owner.name} ${project.owner.surname}` : '—'}
                                </span>
                            </div>
                            <div className="ph-meta-item">
                                <span className="ph-label">Start Date</span>
                                <span className="ph-value">{project.startAt ? project.startAt.split("T")[0] : '—'}</span>
                            </div>
                            <div className="ph-meta-item">
                                <span className="ph-label">Deadline</span>
                                <span className="ph-value">{project.deadlineAt ? project.deadlineAt.split("T")[0] : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="project-quick-stats">
                        <div className="pq-stat">
                            <div className="pq-value">{project.membersCount}</div>
                            <div className="pq-label">Members</div>
                        </div>
                        <div className="pq-stat">
                            <div className="pq-value success">{project.tasksCount}</div>
                            <div className="pq-label">Tasks</div>
                        </div>
                        <div className="pq-stat">
                            <div className="pq-value">{projectFiles.length}</div>
                            <div className="pq-label">Files</div>
                        </div>
                        <div className="pq-stat">
                            <div className="pq-value">{tasks.reduce((sum, task) => sum + (task.commentsCount || 0), 0)}</div>
                            <div className="pq-label">Comments</div>
                        </div>
                        <div className="pq-stat">
                            <div className="pq-value success-dot">{formatStatus(project.status)}</div>
                            <div className="pq-label">Status</div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="project-tabs-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                className={`ptab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Area */}
                    <div className="project-tab-content">
                        {renderTabContent()}
                    </div>
                </div>

                <TaskDetailsDrawer 
                    task={selectedTask} 
                    projectId={projectId} 
                    onClose={() => setSelectedTask(null)} 
                    onTaskUpdated={handleTaskUpdated} 
                />
            </main>
        </div>
    );
};

export default ProjectDetails;
