import { useEffect, useState } from 'react';
import { FolderClosed, CheckCircle2, Clock, CalendarX2 } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import ProgressChart from './components/ProgressChart.jsx';
import StatusChart from './components/StatusChart.jsx';
import UpcomingTasks from './components/UpcomingTasks.jsx';
import RecentActivity from './components/RecentActivity.jsx';
import TeamWorkload from './components/TeamWorkload.jsx';
import './Dashboard.css';

import { jwtDecode } from "jwt-decode";
import { navigate } from "../../router/Router.jsx";
import projects from "../../api/projects.js"
import tasks from "../../api/tasks.js"
import activities from "../../api/activities.js"

const Dashboard = () => {

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        }
    }, []);

    const token = localStorage.getItem("accessToken");
    let decodedToken = null;

    if (token) {
        try {
            decodedToken = jwtDecode(token);
            console.log("Decoded Token:", decodedToken);
        } catch (error) {
            console.error("Invalid token format:", error);
        }
    }

    const [stats, setStats] = useState({ projects: 0, tasks: 0, statuses: {}, upcomingTasks: [], workload: [], recentActivities: [] });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Ждем реальные ответы от сервера
                const projectsCount = await projects.getProjectsCount();
                const tasksCount = await tasks.getTasksCount();
                const tasksCountByStatuses = await tasks.getTasksCountByStatuses();
                const upcomingTasks = await tasks.getUpcomingTasks();
                let workload = [];
                try {
                    workload = await tasks.getTeamWorkload();
                } catch (e) {
                    console.error("Could not fetch team workload", e);
                }

                let recentActivities = [];
                try {
                    recentActivities = await activities.getRecentActivities();
                } catch (e) {
                    console.error("Could not fetch recent activities", e);
                }

                console.log("Projects:", projectsCount);
                console.log("Tasks:", tasksCount);
                console.log("Statuses:", tasksCountByStatuses);
                console.log("Upcoming Tasks:", upcomingTasks);
                console.log("Team Workload:", workload);
                console.log("Recent Activities:", recentActivities);

                // Сохраняем все в стейт
                setStats({
                    projects: projectsCount,
                    tasks: tasksCount,
                    statuses: tasksCountByStatuses,
                    upcomingTasks: upcomingTasks,
                    workload: workload,
                    recentActivities: recentActivities,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header />

                <div className="dashboard-content">
                    {/* Top Row: Stats */}
                    <div className="stats-grid">
                        <StatCard
                            title="Total Projects"
                            value={stats.projects?.count || 0}
                            change={stats.projects?.change || 0}
                            isPositive={(stats.projects?.change || 0) >= 0}
                            icon={FolderClosed}
                            iconBg="var(--bg-accent-light)"
                            iconColor="var(--accent-color)"
                        />
                        <StatCard
                            title="Tasks Completed"
                            value={stats.statuses?.done || 0}
                            change={stats.statuses?.doneChange || 0}
                            isPositive={(stats.statuses?.doneChange || 0) >= 0}
                            icon={CheckCircle2}
                            iconBg="var(--bg-success-light)"
                            iconColor="#10B981"
                        />
                        <StatCard
                            title="Tasks In Progress"
                            value={stats.statuses?.inProgress || 0}
                            change={stats.statuses?.inProgressChange || 0}
                            isPositive={(stats.statuses?.inProgressChange || 0) >= 0}
                            icon={Clock}
                            iconBg="var(--bg-warning-light)"
                            iconColor="#F59E0B"
                        />
                        <StatCard
                            title="Overdue Tasks"
                            value={stats.statuses?.overdue || 0}
                            change={stats.statuses?.overdueChange || 0}
                            isPositive={(stats.statuses?.overdueChange || 0) <= 0}
                            icon={CalendarX2}
                            iconBg="var(--bg-danger-light)"
                            iconColor="#EF4444"
                        />
                    </div>

                    {/* Middle Row: Charts */}
                    <div className="charts-grid">
                        <ProgressChart />
                        <StatusChart statuses={stats.statuses} />
                    </div>

                    {/* Bottom Row: Lists */}
                    <div className="lists-grid">
                        <div className="lists-left">
                            <UpcomingTasks upcomingTasks={stats?.upcomingTasks} />
                        </div>
                        <div className="lists-right">
                            <RecentActivity precomputedActivities={stats.recentActivities} />
                            <TeamWorkload precomputedWorkload={stats.workload} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
