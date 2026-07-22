import { navigate } from "../../../router/Router.jsx";

const Link = ({ href, children, className = '', style }) => {
    const handleClick = (e) => {
        e.preventDefault();
        navigate(href);
    };

    return (
        <a href={href} onClick={handleClick} className={className} style={style}>
            {children}
        </a>
    );
};

export default Link;
