import AuthField from "../AuthField.jsx";
import AuthButton from "../AuthButton.jsx";
import AuthFooter from "../AuthFooter.jsx";

const LoginPage = () => {
    return (
        <main className="auth">

            <div className="auth-card">

                <div className="auth-header">
                    <h1>Welcome back!</h1>

                    <p>
                        Sign in to continue managing your projects.
                    </p>
                </div>

                <form className="auth-form">

                    <AuthField inputType="email" placeholder="Email" labelText="Enter your email" />

                    <AuthField inputType="password" placeholder="Password" labelText="Enter your password" />

                    <div className="auth-options">

                        <label className="remember">

                            <input type="checkbox"/>

                            Remember me

                        </label>

                        <a href="#">
                            Forgot password?
                        </a>

                    </div>

                    <AuthButton buttonText="Sign in"/>

                </form>

                <AuthFooter/>

                <p className="bottom-text">

                    Don't have an account?

                    <a href="/register">

                        Sign up

                    </a>

                </p>

            </div>

        </main>
    )
}

export default LoginPage;