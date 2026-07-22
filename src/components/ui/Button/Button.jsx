const Button = ({ children, onClick, className = '', type = 'button' }) => {
    return (
        <button className={className} onClick={onClick} type={type}>
            {children}
        </button>
    );
};

export default Button;
