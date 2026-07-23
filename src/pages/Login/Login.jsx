import { useState } from "react";
import InputField from "../../components/ui/InputField/InputField.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import Link from "../../components/ui/Link/Link.jsx";
import AuthFooter from "../../components/layout/AuthFooter/AuthFooter.jsx";
import authAPI from "../../api/auth.js";
import { navigate } from "../../router/Router.jsx";
import "./Auth.css"; // We will move Auth.css here

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {}

        if (!email.includes("@")) {
            newErrors.email = "Invalid email"
        }

        if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})

        try {
            const data = await authAPI.login(email, password);
            console.log("Logged in successfully:", data);
            localStorage.setItem("token", data?.token);
            localStorage.setItem("firstname", data?.firstname);
            localStorage.setItem("lastname", data?.lastname);
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to login:", error);
        }
    };

    return (
        <main className="auth">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome back!</h1>
                    <p>Sign in to continue managing your projects.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <InputField
                        inputType="email"
                        placeholder="Email"
                        labelText="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                    />

                    <InputField
                        inputType="password"
                        placeholder="Password"
                        labelText="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                    />

                    <div className="auth-options">
                        <label className="remember">
                            <input type="checkbox" />
                            Remember me
                        </label>

                        <a href="#">Forgot password?</a>
                    </div>

                    <Button type="submit" className="auth-button">
                        Sign in
                    </Button>
                </form>

                <AuthFooter />

                <p className="bottom-text">
                    Don't have an account?
                    <Link href="/register">Sign up</Link>
                </p>
            </div>
        </main>
    )
}

export default Login;
