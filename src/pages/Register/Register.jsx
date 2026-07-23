import { useState } from "react";
import InputField from "../../components/ui/InputField/InputField.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import Link from "../../components/ui/Link/Link.jsx";
import AuthFooter from "../../components/layout/AuthFooter/AuthFooter.jsx";
import { navigate } from "../../router/Router.jsx";
import "../Login/Auth.css"; // Reuse CSS from Login
import authAPI from "../../api/auth.js";

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {}

        if (!termsAccepted) {
            newErrors.terms = "You must accept the terms and conditions"
        }

        if (firstName.trim().length === 0 || lastName.trim().length === 0) {
            newErrors.firstName = "First and last name is required"
        }

        if (!email.includes("@")) {
            newErrors.email = "Invalid email"
        }

        if (password.length < 8) {
            newErrors.password = "Password length must be at least 8 characters"
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})

        try {
            const data = await authAPI.register(firstName, lastName, email, password);
            console.log("Registered successfully", data)
            navigate("/login");
        } catch (error) {
            console.log("Error:", error)
            setErrors({ "backendError": "User with this email already exists" })
        }
    };

    console.log("Register rendered. Current errors:", errors);

    return (
        <main className="auth">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create account</h1>
                    <p>Join ProManage and start managing your projects today.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <InputField
                            inputType="text"
                            placeholder="John"
                            labelText="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            error={errors.firstName}
                        />
                        <InputField
                            inputType="text"
                            placeholder="Smith"
                            labelText="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            error={errors.lastName}
                        />
                    </div>

                    <InputField
                        labelText="Email"
                        inputType="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                    />

                    <InputField
                        labelText="Password"
                        inputType="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                    />

                    <InputField
                        labelText="Confirm password"
                        inputType="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                    />

                    <label className="terms">
                        <input type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)} />

                        I agree with the
                        <a href="#"> Terms of Service </a>
                        &
                        <a href="#"> Privacy Policy</a>
                    </label>
                    {errors.terms && <p className="error">{errors.terms}</p>}
                    {errors.backendError && <p className="error">{errors.backendError}</p>}

                    <Button type="submit" className="auth-button">
                        Sign up
                    </Button>
                </form>

                <AuthFooter />

                <p className="bottom-text">
                    Already have an account?
                    <Link href="/login">Sign in</Link>
                </p>
            </div>
        </main>
    )
}

export default Register;
