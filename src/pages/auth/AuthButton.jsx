const AuthButton = (props) => {

    const { buttonText } = props;

    return (
        <button className="auth-button">

            {buttonText}

        </button>
    )

}

export default AuthButton;