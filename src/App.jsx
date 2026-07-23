import './styles/normalize.css'
import Router from "./router/Router.jsx";
import Preview from "./pages/Preview/Preview.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";

function App() {
  const routes = {
    '/': Preview,
    '/login': Login,
    '/register': Register,
    '/dashboard': Dashboard,
    '*': () => <div>404 not found</div>,
  }

  return (
    <Router routes={routes}></Router>
  )
}

export default App
