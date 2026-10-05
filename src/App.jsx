import './styles/normalize.css'
import Router from "./router/Router.jsx";
import Preview from "./pages/Preview/Preview.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Projects from "./pages/Projects/Projects.jsx";
import CreateProject from "./pages/CreateProject/CreateProject.jsx";
import ProjectDetails from "./pages/ProjectDetails/ProjectDetails.jsx";
import CreateTask from "./pages/CreateTask/CreateTask.jsx";
import InviteMembers from "./pages/InviteMembers/InviteMembers.jsx";
import Tasks from "./pages/Tasks/Tasks.jsx";
import EditProject from "./pages/EditProject/EditProject.jsx";
import CalendarPage from "./pages/Calendar/Calendar.jsx";
import TeamPage from "./pages/Team/Team.jsx";
import ReportsPage from "./pages/Reports/Reports.jsx";
import MessagesPage from "./pages/Messages/Messages.jsx";
import FilesPage from "./pages/Files/Files.jsx";
import SettingsPage from "./pages/Settings/Settings.jsx";
import UserProfile from "./pages/UserProfile/UserProfile.jsx";
import { useEffect } from 'react';

import GithubCallback from "./pages/Auth/GithubCallback.jsx";

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    const accentColor = localStorage.getItem('accentColor') || '#592BF0';
    const compactMode = localStorage.getItem('compactMode') === 'true';

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    }
  }, []);
  const routes = {
    '/': Preview,
    '/login': Login,
    '/register': Register,
    '/auth/github/callback': GithubCallback,
    '/dashboard': Dashboard,
    '/projects': Projects,
    '/projects/new': CreateProject,
    '/projects/:id/tasks/new': CreateTask,
    '/projects/:id/invite': InviteMembers,
    '/projects/:id/edit': EditProject,
    '/projects/:id': ProjectDetails,
    '/tasks': Tasks,
    '/calendar': CalendarPage,
    '/team': TeamPage,
    '/reports': ReportsPage,
    '/messages': MessagesPage,
    '/files': FilesPage,
    '/settings': SettingsPage,
    '/user/:id': UserProfile,
    '*': () => <div>404 not found</div>,
  }

  return (
    <Router routes={routes}></Router>
  )
}

export default App
