import {navigate} from "../../Routing/Router.jsx";

const Button = (props) => {
    const { className, buttonText, urlPath } = props

    return (
        <button className={`${className}`} onClick={() => navigate(urlPath)}>{buttonText}</button>
    )
}

export default Button;