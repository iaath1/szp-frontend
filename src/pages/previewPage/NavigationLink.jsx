const NavigationLink = (props) => {
    const {linkText} = props;

    return (
        <span className="nav-element"><a className="nav-element a" href="/#">{linkText}</a></span>
    )
}

export default NavigationLink;