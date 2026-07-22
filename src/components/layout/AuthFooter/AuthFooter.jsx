import Button from "../../ui/Button/Button.jsx";

const AuthFooter = () => {
    return (
        <>
        <div className="divider">
            <span>or</span>
        </div>
        <Button className="social-button">
            Continue with Google
        </Button>

        <Button className="social-button">
            Continue with GitHub
        </Button>
        </>
    )
}

export default AuthFooter;
