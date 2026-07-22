import Link from "../../ui/Link/Link.jsx";
import Button from "../../ui/Button/Button.jsx";
import { navigate } from "../../../router/Router.jsx";

const NavigationLink = ({ linkText, href = "#" }) => (
    <Link href={href} className="nav-element-link" style={{ fontWeight: 600, color: 'black', marginLeft: '40px', textDecoration: 'none' }}>
        {linkText}
    </Link>
);

const Navigation = () => {
    return (
        <header className="header-nav">
            <span className="logo">ProManage</span>
            <NavigationLink linkText={"Possibilities"} />
            <NavigationLink linkText={"Tariffs"} />
            <NavigationLink linkText={"About us"} />
            <NavigationLink linkText={"Blog"} />
            <NavigationLink linkText={"Contacts"} />
            
            <Button 
                className="nav-element login" 
                onClick={() => navigate('/login')}
            >
                Login
            </Button>
            <Button className="nav-element try">
                Try it for free
            </Button>
        </header>
    )
}

export default Navigation;
