import Button from "../../ui/Button/Button.jsx";
import { GoogleLogin } from '@react-oauth/google';
import authAPI from "../../../api/auth.js";
import { navigate } from "../../../router/Router.jsx";

const AuthFooter = () => {
    const handleGoogleSuccess = async (credentialResponse) => {
        console.log("GOOGLE RESPONSE:", credentialResponse);
        try {
            const data = await authAPI.loginWithGoogle(credentialResponse.credential);
            console.log("Logged in via Google:", data);
            localStorage.setItem("accessToken", data?.accessToken);
            localStorage.setItem("refreshToken", data?.refreshToken);
            localStorage.setItem("firstname", data?.firstname);
            localStorage.setItem("lastname", data?.lastname);
            localStorage.setItem("avatar", data?.avatarUrl);
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to login with Google:", error);
        }
    };
    const handleGithubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = "http://localhost:5173/auth/github/callback";
        const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
        window.location.href = githubUrl;
    };

    return (
        <>
        <div className="divider">
            <span>or</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.log('Login Failed');
                }}
            />
        </div>

        <Button className="social-button" onClick={handleGithubLogin}>
            Continue with GitHub
        </Button>
        </>
    )
}

export default AuthFooter;
