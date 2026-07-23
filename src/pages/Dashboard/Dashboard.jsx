import { useEffect } from 'react';
import { FolderClosed, CheckCircle2, Clock, CalendarX2 } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import StatCard from './components/StatCard.jsx';
import ProgressChart from './components/ProgressChart.jsx';
import StatusChart from './components/StatusChart.jsx';
import UpcomingTasks from './components/UpcomingTasks.jsx';
import RecentActivity from './components/RecentActivity.jsx';
import TeamWorkload from './components/TeamWorkload.jsx';
import './Dashboard.css';

import { jwtDecode } from "jwt-decode";
import { navigate } from "../../router/Router.jsx";
import projects from "../../api/projects.js"

const Dashboard = () => {

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
        }
    }, []);

    const token = localStorage.getItem("token");
    let decodedToken = null;

    if (token) {
        try {
            decodedToken = jwtDecode(token);
            console.log("Decoded Token:", decodedToken);
        } catch (error) {
            console.error("Invalid token format:", error);
        }
    }

    const projectsCount = projects.getProjectsCount();
    console.log(projectsCount);

    const tasksCount = projects.getTasksCount();
    console.log(tasksCount)

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
                            value="8"
                            change={2}
                            isPositive={true}
                            icon={FolderClosed}
                            iconBg="#F3F0FF"
                            iconColor="#592BF0"
                        />
                        <StatCard
                            title="Tasks Completed"
                            value="24"
                            change={12}
                            isPositive={true}
                            icon={CheckCircle2}
                            iconBg="#ECFDF5"
                            iconColor="#10B981"
                        />
                        <StatCard
                            title="Tasks In Progress"
                            value="16"
                            change={-4}
                            isPositive={false}
                            icon={Clock}
                            iconBg="#FEF3C7"
                            iconColor="#F59E0B"
                        />
                        <StatCard
                            title="Overdue Tasks"
                            value="5"
                            change={-2}
                            isPositive={false}
                            icon={CalendarX2}
                            iconBg="#FEE2E2"
                            iconColor="#EF4444"
                        />
                    </div>

                    {/* Middle Row: Charts */}
                    <div className="charts-grid">
                        <ProgressChart />
                        <StatusChart />
                    </div>

                    {/* Bottom Row: Lists */}
                    <div className="lists-grid">
                        <div className="lists-left">
                            <UpcomingTasks />
                        </div>
                        <div className="lists-right">
                            <RecentActivity />
                            <TeamWorkload />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;