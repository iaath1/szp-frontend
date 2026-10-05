import { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import { navigate } from "../../router/Router.jsx";
import projects from "../../api/projects.js";
import tasks from "../../api/tasks.js";
import './CreateTask.css';

const CreateTask = ({ params }) => {
    const projectId = params?.id;
    const [members, setMembers] = useState([]);
    const [milestones, setMilestones] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: "TODO",
        priority: "MEDIUM",
        deadlineAt: '',
        assigneeEmail: '',
        milestoneId: ''
    });

    const [projectDefaultStatus, setProjectDefaultStatus] = useState(null);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!projectId) return;
            try {
                const [fetchedMembers, fetchedMilestones, projectInfo] = await Promise.all([
                    projects.getProjectMembers(projectId),
                    projects.getProjectMilestones(projectId),
                    projects.getProjectInfo(projectId)
                ]);

                setMembers(fetchedMembers || []);
                setMilestones(fetchedMilestones || []);

                const defaultStatus = projectInfo?.defaultTaskStatus || 'TODO';
                setProjectDefaultStatus(defaultStatus);
                setFormData(prev => ({ ...prev, status: defaultStatus }));
            } catch (error) {
                console.error("Error fetching project data:", error);
            }
        };
        fetchProjectData();
    }, [projectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.deadlineAt) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Обнуляем время для корректного сравнения дат
            const deadline = new Date(formData.deadlineAt);
            if (deadline < today) {
                alert("Deadline cannot be in the past.");
                return;
            }
        }

        const payload = {
            ...formData,
            deadlineAt: formData.deadlineAt ? formData.deadlineAt : null
        };

        try {
            await tasks.createTask(projectId, payload);
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error("Failed to create task:", error);
        }
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header
                    title="Create New Task"
                    subtitle="Add a new task to your project."
                    onBack={() => navigate(`/projects/${projectId}`)}
                />

                <div className="dashboard-content create-task-content">
                    <div className="create-task-grid">
                        {/* Left Column */}
                        <form className="ct-left-col" onSubmit={handleSubmit}>
                            {/* Task Details */}
                            <div className="ct-section">
                                <h3 className="ct-section-title">Task Details</h3>

                                <div className="ct-form-group">
                                    <label>Task Title <span className="required">*</span></label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter task title" className="ct-input" required />
                                </div>

                                <div className="ct-form-group mt-20">
                                    <label>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the task in detail..." className="ct-textarea"></textarea>
                                    <div className="char-count">{formData.description.length} / 500</div>
                                </div>
                            </div>

                            {/* Task Properties */}
                            <div className="ct-section mt-30">
                                <h3 className="ct-section-title">Properties</h3>

                                <div className="ct-form-row">
                                    <div className="ct-form-group">
                                        <label>Status <span className="required">*</span></label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="ct-select" required>
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="REVIEW">Review</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>
                                    <div className="ct-form-group">
                                        <label>Priority <span className="required">*</span></label>
                                        <select name="priority" value={formData.priority} onChange={handleChange} className="ct-select" required>
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="CRITICAL">Critical</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="ct-form-row mt-20">
                                    <div className="ct-form-group">
                                        <label>Deadline</label>
                                        <input type="datetime-local" name="deadlineAt" value={formData.deadlineAt} onChange={handleChange} className="ct-input" />
                                    </div>
                                    <div className="ct-form-group">
                                        <label>Assignee</label>
                                        <select name="assigneeEmail" value={formData.assigneeEmail} onChange={handleChange} className="ct-select">
                                            <option value="">Unassigned</option>
                                            {members.map(member => (
                                                <option key={member.id} value={member.email}>{member.name} {member.surname} ({member.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="ct-form-row mt-20">
                                    <div className="ct-form-group" style={{ width: '50%' }}>
                                        <label>Milestone</label>
                                        <select name="milestoneId" value={formData.milestoneId} onChange={handleChange} className="ct-select">
                                            <option value="">No Milestone</option>
                                            {milestones.map(milestone => (
                                                <option key={milestone.id} value={milestone.id}>{milestone.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="ct-actions">
                                <button type="button" className="btn-cancel" onClick={() => navigate(`/projects/${projectId}`)}>Cancel</button>
                                <button type="submit" className="btn-create">Create Task</button>
                            </div>
                        </form>

                        {/* Right Column */}
                        <div className="ct-right-col">
                            {/* Tips */}
                            <div className="tips-box">
                                <div className="tips-header">
                                    <div className="tips-icon">
                                        <Lightbulb size={18} color="#F59E0B" />
                                    </div>
                                    <h4 className="tips-title">Task Writing Tips</h4>
                                </div>
                                <ul className="tips-list">
                                    <li>Keep titles short and actionable (e.g. "Design homepage banner").</li>
                                    <li>Use descriptions to provide context and acceptance criteria.</li>
                                    <li>Assign a deadline to ensure timely completion.</li>
                                    <li>Set the correct priority to help the team focus on what matters.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateTask;
