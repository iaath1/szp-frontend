import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { navigate } from '../../../router/Router.jsx';
import './TasksTab.css';

const MOCK_TASKS = [
    { id: 1, title: 'Create Figma Design', assignee: '11', priority: 'High', status: 'In Progress', due: 'May 28, 2024' },
    { id: 2, title: 'REST API Development', assignee: '12', priority: 'Medium', status: 'Review', due: 'Jun 10, 2024' },
    { id: 3, title: 'Database Schema Design', assignee: '13', priority: 'High', status: 'Done', due: 'May 15, 2024' },
    { id: 4, title: 'User Authentication', assignee: '14', priority: 'High', status: 'To Do', due: 'Jun 25, 2024' },
    { id: 5, title: 'Performance Testing', assignee: '15', priority: 'Low', status: 'To Do', due: 'Jul 05, 2024' },
];

const TasksTab = ({ tasks, projectId, projectKey, onTaskClick }) => {
    return (
        <div className="tasks-tab">
            <div className="tasks-toolbar">
                <div className="tasks-search">
                    <Search size={18} color="#9CA3AF" />
                    <input type="text" placeholder="Search tasks..." />
                </div>
                <div className="tasks-actions">
                    <button className="btn-secondary"><Filter size={16} /> Filters</button>
                    <button className="btn-primary" onClick={() => navigate(`/projects/${projectId}/tasks/new`)}>
                        <Plus size={16} /> Add Task
                    </button>
                </div>
            </div>

            <div className="tasks-table-container">
                <table className="tasks-table">
                    <thead>
                        <tr>
                            <th>Task ID</th>
                            <th>Task Name</th>
                            <th>Assignee</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Due Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(tasks) ? tasks : []).map(task => (
                            <tr key={task.id} onClick={() => onTaskClick && onTaskClick(task)} style={{ cursor: 'pointer' }}>
                                <td>
                                    <span style={{ fontWeight: '500', color: '#6B7280', fontSize: '0.875rem' }}>
                                        {projectKey}-{task.id}
                                    </span>
                                </td>
                                <td>
                                    <div className="task-title-cell">
                                        <div className={`status-indicator ${task.status?.toLowerCase().replace(' ', '-') || 'none'}`}></div>
                                        <span>{task.title}</span>
                                    </div>
                                </td>
                                <td>
                                    {task.assigneeEmail ? (
                                        <div className="flex-align">
                                            <div className="avatar-small">
                                                {task.assigneeEmail.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{marginLeft: '8px'}}>{task.assigneeEmail}</span>
                                        </div>
                                    ) : (
                                        <span className="unassigned-text">Unassigned</span>
                                    )}
                                </td>
                                <td>
                                    {task.priority ? (
                                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                                            {task.priority}
                                        </span>
                                    ) : (
                                        <span className="priority-badge none">None</span>
                                    )}
                                </td>
                                <td>
                                    {task.status && (
                                        <span className={`task-status ${task.status.toLowerCase().replace(' ', '-')}`}>
                                            {task.status}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className="task-due">
                                        {task.deadlineAt ? new Date(task.deadlineAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TasksTab;
