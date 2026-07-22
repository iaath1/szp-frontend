import App from "../../App.jsx";
import NavigationLink from "./NavigationLink.jsx";
import Button from "./Button.jsx";

const Navigation = () => {
    return (
        <header className="header-nav">
            <span className="logo">ProManage</span>
            <NavigationLink linkText={"Posibilities"}/>
            <NavigationLink linkText={"Tarifs"}/>
            <NavigationLink linkText={"About us"}/>
            <NavigationLink linkText={"Blog"}/>
            <NavigationLink linkText={"Contacts"}/>
            <Button className={"nav-element login"} urlPath={"/login"} buttonText={"Login"}/>
            <Button className={"nav-element try"} buttonText={"Try it for free"}/>
        </header>
    )
}

export default Navigation;