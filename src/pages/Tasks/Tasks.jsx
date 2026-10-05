import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, Plus, MoreVertical, LayoutGrid, Calendar as CalendarIcon, AlignJustify } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar.js';
import { getProjectColor, getProjectKey, formatTaskId } from '../../utils/taskUtils.js';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import './Tasks.css';
import tasks from '../../api/tasks.js';
import projectsApi from '../../api/projects.js';
import { navigate } from '../../router/Router.jsx';
import TaskDetailsDrawer from '../ProjectDetails/components/TaskDetailsDrawer.jsx';



const Tasks = () => {
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    
    const [selectedProject, setSelectedProject] = useState('ALL');
    const [showProjectFilterDropdown, setShowProjectFilterDropdown] = useState(false);

    const [selectedPriority, setSelectedPriority] = useState('ALL');
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

    const [activeView, setActiveView] = useState('Table'); // Table, Kanban, Calendar
    const [selectedTask, setSelectedTask] = useState(null);

    const [myTasks, setMyTasks] = useState([]);
    const [allMyTasks, setAllMyTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);

    const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 });
    const [upcomingTasks, setUpcomingTasks] = useState([]);

    const statusOptions = [
        { label: 'All Statuses', tabName: 'All Tasks', value: 'ALL' },
        { label: 'To Do', tabName: 'To Do', value: 'TODO' },
        { label: 'In Progress', tabName: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Review', tabName: 'Review', value: 'REVIEW' },
        { label: 'Completed', tabName: 'Completed', value: 'DONE' }
    ];

    const getTabCount = (value) => {
        if (value === 'ALL') return allMyTasks.length;
        const normalizedValue = value.replace('_', '').toUpperCase();
        return allMyTasks.filter(t => {
            const tStatus = (t.status || 'TODO').replace('_', '').toUpperCase();
            return tStatus === normalizedValue;
        }).length;
    };

    const currentStatusObj = statusOptions.find(opt => opt.value === selectedStatus) || statusOptions[0];

    const priorityOptions = [
        { label: 'All Priorities', value: 'ALL' },
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' }
    ];
    const currentPriorityObj = priorityOptions.find(opt => opt.value === selectedPriority) || priorityOptions[0];

    const currentProjectObj = selectedProject === 'ALL' 
        ? { title: 'All Projects', name: 'All Projects' } 
        : (projects.find(p => String(p.id) === String(selectedProject)) || { title: 'Unknown Project', name: 'Unknown Project' });

    const filteredTasks = myTasks.filter(task => {
        const matchProject = selectedProject === 'ALL' || String(task.projectId) === String(selectedProject);
        const matchPriority = selectedPriority === 'ALL' || (task.priority || '').toUpperCase() === selectedPriority;
        return matchProject && matchPriority;
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectsApi.getProjects();
                setProjects(res || []);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            }
        };

        const fetchDashboardData = async () => {
            try {
                const stats = await tasks.getTasksCountByStatuses();
                setTaskStats(stats || { todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 });

                const upcoming = await tasks.getUpcomingTasks();
                setUpcomingTasks(upcoming || []);
            } catch (error) {
                console.error("Failed to fetch tasks dashboard data:", error);
            }
        };

        fetchProjects();
        fetchDashboardData();

        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (!e.target.closest('.new-task-dropdown-container')) {
                setShowProjectDropdown(false);
            }
            if (!e.target.closest('.status-filter-dropdown-container')) {
                setShowStatusDropdown(false);
            }
            if (!e.target.closest('.project-filter-dropdown-container')) {
                setShowProjectFilterDropdown(false);
            }
            if (!e.target.closest('.priority-filter-dropdown-container')) {
                setShowPriorityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchTasksByStatus = async () => {
            try {
                const res = await tasks.getMyTasks(selectedStatus);
                console.log(`Tasks response (${selectedStatus}):`, res);
                setMyTasks(res || []);
                if (selectedStatus === 'ALL') {
                    setAllMyTasks(res || []);
                }
            } catch (error) {
                console.error("Failed to fetch tasks by status:", error);
            }
        };

        fetchTasksByStatus();
    }, [selectedStatus]);

    const getStatusClass = (status) => {
        if (!status) return 'todo';
        return status.toLowerCase().replace(/_/g, '-').replace(' ', '-');
    };

    const formatStatus = (status) => {
        if (!status) return 'To Do';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const getPriorityClass = (priority) => {
        if (!priority) return 'low';
        return priority.toLowerCase();
    };

    const formatPriority = (priority) => {
        if (!priority) return 'Low';
        return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleTaskUpdated = (updatedTask) => {
        setMyTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setAllMyTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        if (selectedTask?.id === updatedTask.id) {
            setSelectedTask(updatedTask);
        }
    };

    const totalTasks = taskStats.todo + taskStats.inProgress + taskStats.review + taskStats.done;
    const getPct = (val) => totalTasks === 0 ? 0 : Math.round((val / totalTasks) * 100);

    const donePct = getPct(taskStats.done);
    const reviewPct = getPct(taskStats.review);
    const inProgressPct = getPct(taskStats.inProgress);
    const todoPct = getPct(taskStats.todo);

    const doneOffset = 0;
    const reviewOffset = -donePct;
    const inProgressOffset = -(donePct + reviewPct);
    const todoOffset = -(donePct + reviewPct + inProgressPct);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main global-tasks-main">
                <Header title="" />

                <div className="global-tasks-header">
                    <div className="gth-left">
                        <h1>My Tasks</h1>
                        <p>All tasks assigned to you across projects.</p>
                    </div>
                    <div className="gth-right">
                        <div className="view-toggles">
                            <button
                                className={`view-btn ${activeView === 'Table' ? 'active' : ''}`}
                                onClick={() => setActiveView('Table')}
                            ><AlignJustify size={16} /> Table</button>
                            <button
                                className={`view-btn ${activeView === 'Kanban' ? 'active' : ''}`}
                                onClick={() => setActiveView('Kanban')}
                            ><LayoutGrid size={16} /> Kanban</button>
                            <button
                                className={`view-btn ${activeView === 'Calendar' ? 'active' : ''}`}
                                onClick={() => setActiveView('Calendar')}
                            ><CalendarIcon size={16} /> Calendar</button>
                        </div>
                        <div className="new-task-dropdown-container">
                            <button
                                className="btn-primary"
                                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                            >
                                <Plus size={16} /> New Task
                            </button>

                            {showProjectDropdown && (
                                <div className="project-select-dropdown">
                                    <div className="psd-header">Select Project</div>
                                    <div className="psd-list">
                                        {projects.length > 0 ? (
                                            projects.map(p => (
                                                <button
                                                    key={p.id}
                                                    className="psd-item"
                                                    onClick={() => {
                                                        setShowProjectDropdown(false);
                                                        navigate(`/projects/${p.id}/tasks/new`);
                                                    }}
                                                >
                                                    <div className="psd-icon" style={{ backgroundColor: p.color || getProjectColor(p.id) }}>
                                                        <LayoutGrid size={12} color="white" />
                                                    </div>
                                                    <span className="psd-name">{p.title || p.name}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="psd-empty">No projects found</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="global-tasks-content">
                    {/* Left Column: Table & Filters */}
                    <div className="gt-left-col">
                        <div className="gt-filters">
                            <div className="gt-search">
                                <Search size={18} color="#9CA3AF" />
                                <input type="text" placeholder="Search tasks..." />
                            </div>
                            <div className="gt-dropdown project-filter-dropdown-container" onClick={() => setShowProjectFilterDropdown(!showProjectFilterDropdown)}>
                                <div className="gt-dropdown-content">
                                    <span className="gt-dropdown-label">Project</span>
                                    <span className="gt-dropdown-val">{currentProjectObj.title || currentProjectObj.name}</span>
                                </div>
                                <ChevronDown size={14} color="#6B7280" />
                                {showProjectFilterDropdown && (
                                    <div className="gt-dropdown-menu">
                                        <button
                                            className={`gt-dropdown-item ${selectedProject === 'ALL' ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProject('ALL');
                                                setShowProjectFilterDropdown(false);
                                            }}
                                        >
                                            <span>All Projects</span>
                                        </button>
                                        {projects.map(p => (
                                            <button
                                                key={p.id}
                                                className={`gt-dropdown-item ${String(selectedProject) === String(p.id) ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProject(String(p.id));
                                                    setShowProjectFilterDropdown(false);
                                                }}
                                            >
                                                <span>{p.title || p.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="gt-dropdown status-filter-dropdown-container" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                                <div className="gt-dropdown-content">
                                    <span className="gt-dropdown-label">Status</span>
                                    <span className="gt-dropdown-val">{currentStatusObj.label}</span>
                                </div>
                                <ChevronDown size={14} color="#6B7280" />
                                {showStatusDropdown && (
                                    <div className="gt-dropdown-menu">
                                        {statusOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                className={`gt-dropdown-item ${selectedStatus === opt.value ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedStatus(opt.value);
                                                    setShowStatusDropdown(false);
                                                }}
                                            >
                                                <span>{opt.label}</span>
                                                {selectedStatus === opt.value && <div className="status-dot in-progress" style={{ width: '8px', height: '8px', backgroundColor: '#592BF0', margin: 0 }}></div>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="gt-dropdown priority-filter-dropdown-container" onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}>
                                <div className="gt-dropdown-content">
                                    <span className="gt-dropdown-label">Priority</span>
                                    <span className="gt-dropdown-val">{currentPriorityObj.label}</span>
                                </div>
                                <ChevronDown size={14} color="#6B7280" />
                                {showPriorityDropdown && (
                                    <div className="gt-dropdown-menu">
                                        {priorityOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                className={`gt-dropdown-item ${selectedPriority === opt.value ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPriority(opt.value);
                                                    setShowPriorityDropdown(false);
                                                }}
                                            >
                                                <span>{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="btn-secondary gt-more-filters"><Filter size={16} /> More Filters</button>
                        </div>

                        <div className="gt-tabs">
                            {statusOptions.map(tab => (
                                <button
                                    key={tab.value}
                                    className={`gt-tab ${selectedStatus === tab.value ? 'active' : ''}`}
                                    onClick={() => setSelectedStatus(tab.value)}
                                >
                                    {tab.tabName} <span className="gt-tab-count">{getTabCount(tab.value)}</span>
                                </button>
                            ))}
                        </div>

                        {/* Views */}
                        {activeView === 'Table' && (
                            <>
                                <div className="gt-table-container">
                                    <table className="gt-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                                                <th>ID</th>
                                                <th>Task Title</th>
                                                <th>Project</th>
                                                <th>Status</th>
                                                <th>Priority</th>
                                                <th>Due Date</th>
                                                <th>Assignee</th>
                                                <th style={{ width: '40px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTasks?.map(task => (
                                                <tr key={task.id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                                                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                                                    <td className="gt-td-id" style={{ fontWeight: '500', color: '#6B7280' }}>
                                                        {formatTaskId(task)}
                                                    </td>
                                                    <td className="gt-td-title">{task.title}</td>
                                                    <td>
                                                        <div className="gt-td-project">
                                                            <div className="gt-project-icon" style={{ backgroundColor: getProjectColor(task.projectId) }}>
                                                                <LayoutGrid size={12} color="white" />
                                                            </div>
                                                            {task.projectTitle || `Project ${task.projectId}`}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`task-status ${getStatusClass(task.status)}`}>
                                                            {formatStatus(task.status)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                                                            {formatPriority(task.priority)}
                                                        </span>
                                                    </td>
                                                    <td className={`gt-td-due ${task.priority === 'HIGH' ? 'overdue-text' : ''}`}>
                                                        {formatDate(task.deadlineAt)}
                                                    </td>
                                                    <td>
                                                        <div className="gt-td-assignee">
                                                            {task.assigneeEmail ? (
                                                                <>
                                                                    <img src={getAvatarUrl(task.assigneeAvatarUrl, task.assigneeEmail)} alt={task.assigneeEmail} />
                                                                    {task.assigneeEmail}
                                                                </>
                                                            ) : (
                                                                <span style={{ color: '#9CA3AF' }}>Unassigned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td><button className="btn-icon-small"><MoreVertical size={16} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="gt-pagination">
                                    <span className="gt-page-info">Showing 1 to {filteredTasks.length} of {filteredTasks.length} tasks</span>
                                    <div className="gt-page-controls">
                                        <button className="gt-page-btn">&lt;</button>
                                        <button className="gt-page-btn active">1</button>
                                        <button className="gt-page-btn">2</button>
                                        <button className="gt-page-btn">3</button>
                                        <button className="gt-page-btn">&gt;</button>
                                    </div>
                                    <div className="gt-per-page">
                                        10 per page <ChevronDown size={14} />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeView === 'Kanban' && (
                            <div className="gt-kanban-container">
                                {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(status => (
                                    <div key={status} className="gt-kanban-col">
                                        <div className="gt-kanban-header">
                                            <h3>{formatStatus(status)}</h3>
                                            <span className="gt-kanban-count">
                                                {filteredTasks.filter(t => (t.status || 'TODO').replace('_', '').toUpperCase() === status.replace('_', '').toUpperCase()).length}
                                            </span>
                                        </div>
                                        <div className="gt-kanban-list">
                                            {filteredTasks.filter(t => (t.status || 'TODO').replace('_', '').toUpperCase() === status.replace('_', '').toUpperCase()).map(task => (
                                                <div key={task.id} className="gt-kanban-card" onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                                                    <div className="gt-kc-top">
                                                        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                                                            {formatPriority(task.priority)}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#9CA3AF' }}>
                                                            {formatTaskId(task)}
                                                        </span>
                                                    </div>
                                                    <h4>{task.title}</h4>
                                                    <div className="gt-kc-project">
                                                        <div className="gt-project-icon" style={{ backgroundColor: getProjectColor(task.projectId), width: '16px', height: '16px' }}>
                                                            <LayoutGrid size={10} color="white" />
                                                        </div>
                                                        {task.projectTitle || `Project ${task.projectId}`}
                                                    </div>
                                                    <div className="gt-kc-bottom">
                                                        <div className={`gt-kc-date ${task.priority === 'HIGH' ? 'overdue-text' : ''}`}>
                                                            <CalendarIcon size={12} /> {formatDate(task.deadlineAt)}
                                                        </div>
                                                        {task.assigneeEmail && (
                                                            <img src={getAvatarUrl(task.assigneeAvatarUrl, task.assigneeEmail)} alt="Assignee" className="gt-kc-avatar" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeView === 'Calendar' && (
                            <div className="gt-calendar-container">
                                <div className="gt-calendar-header">
                                    <button className="btn-icon-small">&lt;</button>
                                    <h3>July 2026</h3>
                                    <button className="btn-icon-small">&gt;</button>
                                </div>
                                <div className="gt-calendar-grid">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="gt-cal-day-name">{day}</div>
                                    ))}
                                    {Array.from({ length: 35 }).map((_, i) => {
                                        const dayNum = (i % 30) + 1;
                                        // Mock tasks on some days
                                        const dayTasks = dayNum === 30 ? filteredTasks : [];
                                        return (
                                            <div key={i} className={`gt-cal-cell ${dayNum === 30 ? 'today' : ''}`}>
                                                <span className="gt-cal-date">{dayNum}</span>
                                                <div className="gt-cal-tasks">
                                                    {dayTasks.map(t => (
                                                        <div key={t.id} className={`gt-cal-task-pill bg-${getStatusClass(t.status)}`} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                                                            {t.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Widgets */}
                    <div className="gt-right-col">
                        <div className="gt-widget">
                            <h3>Task Summary</h3>
                            <div className="gt-summary-list">
                                <div className="gt-summary-item">
                                    <div className="gt-si-left">
                                        <CalendarIcon size={16} color="#EF4444" /> Due Today
                                    </div>
                                    <div className="gt-si-right" style={{ color: '#EF4444' }}>
                                        {upcomingTasks.filter(t => new Date(t.deadlineAt).toDateString() === new Date().toDateString()).length}
                                    </div>
                                </div>
                                <div className="gt-summary-item">
                                    <div className="gt-si-left">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        Overdue
                                    </div>
                                    <div className="gt-si-right" style={{ color: '#EF4444' }}>{taskStats.overdue}</div>
                                </div>
                                <div className="gt-summary-item">
                                    <div className="gt-si-left">
                                        <div className="status-dot in-progress"></div> In Progress
                                    </div>
                                    <div className="gt-si-right" style={{ color: '#3B82F6' }}>{taskStats.inProgress}</div>
                                </div>
                                <div className="gt-summary-item">
                                    <div className="gt-si-left">
                                        <div className="status-dot done"></div> Completed
                                    </div>
                                    <div className="gt-si-right" style={{ color: '#10B981' }}>{taskStats.done}</div>
                                </div>
                            </div>
                        </div>

                        <div className="gt-widget">
                            <h3>Tasks by Status</h3>
                            <div className="gt-chart-container">
                                <div className="gt-donut-chart">
                                    <svg viewBox="0 0 36 36" className="circular-chart">
                                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle-completed" strokeDasharray={`${donePct}, 100`} strokeDashoffset={doneOffset} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle-review" strokeDasharray={`${reviewPct}, 100`} strokeDashoffset={reviewOffset} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle-inprogress" strokeDasharray={`${inProgressPct}, 100`} strokeDashoffset={inProgressOffset} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle-todo" strokeDasharray={`${todoPct}, 100`} strokeDashoffset={todoOffset} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="gt-donut-text">
                                        <span className="gt-dt-num">{totalTasks}</span>
                                        <span className="gt-dt-label">Total</span>
                                    </div>
                                </div>
                            </div>
                            <div className="gt-chart-legend">
                                <div className="gt-cl-item">
                                    <div className="gt-cl-left"><div className="status-dot to-do"></div> To Do</div>
                                    <div className="gt-cl-right">{taskStats.todo} ({todoPct}%)</div>
                                </div>
                                <div className="gt-cl-item">
                                    <div className="gt-cl-left"><div className="status-dot in-progress"></div> In Progress</div>
                                    <div className="gt-cl-right">{taskStats.inProgress} ({inProgressPct}%)</div>
                                </div>
                                <div className="gt-cl-item">
                                    <div className="gt-cl-left"><div className="status-dot review"></div> Review</div>
                                    <div className="gt-cl-right">{taskStats.review} ({reviewPct}%)</div>
                                </div>
                                <div className="gt-cl-item">
                                    <div className="gt-cl-left"><div className="status-dot done"></div> Completed</div>
                                    <div className="gt-cl-right">{taskStats.done} ({donePct}%)</div>
                                </div>
                            </div>
                        </div>

                        <div className="gt-widget">
                            <div className="gt-widget-header">
                                <h3>Upcoming Deadlines</h3>
                                <a href="#" className="gt-link">View all</a>
                            </div>
                            <div className="gt-deadlines-list">
                                {upcomingTasks.length > 0 ? upcomingTasks.slice(0, 5).map(task => (
                                    <div key={task.id} className="gt-deadline-item" onClick={() => setSelectedTask(task)} style={{cursor: 'pointer'}}>
                                        <div className={`status-dot ${getStatusClass(task.status)}`}></div>
                                        <div className="gt-dl-info">
                                            <h4>{task.title}</h4>
                                            <span>{formatTaskId(task)}</span>
                                        </div>
                                        <div className={`gt-dl-date ${new Date(task.deadlineAt) < new Date() ? 'overdue-text' : ''}`}>
                                            {formatDate(task.deadlineAt)}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{color: '#9CA3AF', fontSize: '0.875rem', padding: '8px 0'}}>No upcoming deadlines</div>
                                )}
                            </div>
                        </div>

                        <div className="gt-help-card">
                            <h3>Need help?</h3>
                            <p>Learn more about managing your tasks.</p>
                            <a href="#" className="btn-secondary btn-small gt-help-btn">View Documentation <LayoutGrid size={12} /></a>
                        </div>
                    </div>
                </div>
                
                <TaskDetailsDrawer 
                    task={selectedTask} 
                    projectId={selectedTask?.projectId} 
                    onClose={() => setSelectedTask(null)} 
                    onTaskUpdated={handleTaskUpdated} 
                />
            </main>
        </div>
    );
};

export default Tasks;
