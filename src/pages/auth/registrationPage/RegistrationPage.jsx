import AuthField from "../AuthField.jsx";
import AuthFooter from "../AuthFooter.jsx";
import AuthButton from "../AuthButton.jsx";

const RegistrationPage = () => {
    return (
        <main className="auth">

            <div className="auth-card">

                <div className="auth-header">

                    <h1>Create account</h1>

                    <p>
                        Join ProManage and start managing your projects today.
                    </p>

                </div>

                <form className="auth-form">

                    <div className="form-row">

                        <AuthField inputType={"text"} placeholder={"John"} labelText={"First name"} />

                        <AuthField inputType={"text"} placeholder={"Smith"} labelText={"Last name"} />

                    </div>

                    <AuthField labelText="Email" inputType="email" placeholder="Email"/>

                    <AuthField labelText="Password" inputType="password" placeholder="Password"/>

                    <AuthField labelText="Confirm password" inputType="password" placeholder="Confirm password"/>

                    <label className="terms">

                        <input type="checkbox"/>

                        I agree with the
                        <a href="#"> Terms of Service </a>
                        &
                        <a href="#"> Privacy Policy</a>

                    </label>

                    <AuthButton buttonText="Sign up" />

                </form>

                <AuthFooter/>

                <p className="bottom-text">

                    Already have an account?

                    <a href="/login">

                        Sign in

                    </a>

                </p>

            </div>

        </main>
    )
}

export default RegistrationPage;