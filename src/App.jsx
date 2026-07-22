import { useState } from 'react'
import './styles/PreviewPage.css'
import './styles/normalize.css'
import './styles/Auth.css'
import Router from "./Routing/Router.jsx";
import PreviewPage from "./pages/previewPage/PreviewPage.jsx";
import LoginPage from "./pages/auth/loginPage/LoginPage.jsx";
import RegistrationPage from "./pages/auth/registrationPage/RegistrationPage.jsx";


function App() {
  const routes = {
    '/': PreviewPage,
    '/login': LoginPage,
    '/register': RegistrationPage,
    '*': () => <div>404 not found</div>,
  }

  return (
      <Router routes={routes}></Router>
  )
}

export default App
