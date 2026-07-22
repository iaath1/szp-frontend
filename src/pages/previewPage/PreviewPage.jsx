import dashBoardImg from '../../assets/Dashboard-Preview.png'
import Navigation from "./Navigation.jsx";

const PreviewPage = () => {
    return (
        <>
            <Navigation/>

            <div className="hero">
                <div className="hero-text">
                    <h1 className="hero-title">Control <br/> projects.<br/><span>Achieve more</span></h1>
                    <p className="hero-description">ProManage - this is modern platform to manage tasks, teams and projects.
                        Plan, observe progress and achieve goals together</p>
                </div>
                <div className="hero-image">
                    <img src={dashBoardImg} alt="Dashboard"/>
                </div>
            </div>

            <div className="buttons">
                <button className="features-try-for-free">
                    Try for free
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                         stroke="white" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </button>
                <button className="features-watch-demo">
                    Watch demo

                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="20"
                         height="20"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth="2"
                         strokeLinecap="round"
                         strokeLinejoin="round">

                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10 8 16 12 10 16 10 8"/>

                    </svg>
                </button>
            </div>

            <div className="features">
                <div className="features-text">
                    <div className="feature">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="#592bf0" strokeWidth="2">
                            <polygon points="13 2 3 14 11 14 9 22 21 8 13 8 13 2"/>
                        </svg>

                        Fast start
                    </div>
                    <div className="feature">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             width="22"
                             height="22"
                             viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             strokeWidth="2"
                             strokeLinecap="round"
                             strokeLinejoin="round">

                            <rect x="3" y="3" width="7" height="7" rx="2"/>
                            <rect x="14" y="3" width="7" height="7" rx="2"/>
                            <rect x="14" y="14" width="7" height="7" rx="2"/>
                            <rect x="3" y="14" width="7" height="7" rx="2"/>

                        </svg>

                        Comfortable interface
                    </div>
                    <div className="feature">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                             stroke="#592bf0" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>

                        Secure your data
                    </div>
                </div>
            </div>

            <div className="features-2">
                <div className="features-2-element">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                         stroke="#592bf0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <line x1="8" y1="8" x2="8" y2="16"/>
                        <line x1="16" y1="8" x2="16" y2="12"/>
                    </svg>

                    <h4 className="features-2-element-title">Task management</h4>
                    <p className="features-2-element-description">Create tasks, delegate it to someone, and observe progress</p>
                </div>
                <div className="features-2-element">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="40"
                         height="40"
                         viewBox="0 0 24 24"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth="2"
                         strokeLinecap="round"
                         strokeLinejoin="round">

                        <rect x="3" y="4" width="7" height="7" rx="2"/>
                        <rect x="14" y="4" width="7" height="4" rx="2"/>
                        <rect x="14" y="11" width="7" height="9" rx="2"/>
                        <rect x="3" y="14" width="7" height="6" rx="2"/>

                    </svg>

                    <h4 className="features-2-element-title">Plan your projects</h4>
                    <p className="features-2-element-description">Plan etaps, set deadlines, achieve your goals</p>
                </div>
                <div className="features-2-element">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                         stroke="#592bf0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>

                    <h4 className="features-2-element-title">Team work</h4>
                    <p className="features-2-element-description">Comment, share files, and work together in real-time</p>
                </div>
                <div className="features-2-element">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                         stroke="#592bf0" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>

                    <h4 className="features-2-element-title">Analitics and conclusions</h4>
                    <p className="features-2-element-description">Recieve analitic data and decide smart decisions</p>
                </div>
            </div>
        </>
    )
}

export default PreviewPage