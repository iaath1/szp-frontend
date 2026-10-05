const URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const authAPI = {
    login: async (email, password) => {
        const res = await fetch(`${URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            throw new Error(`Login failed with status ${res.status}`);
        }

        return res.json();
    },

    login2fa: async (email, password, code) => {
        const res = await fetch(`${URL}/api/auth/login/2fa?code=${code}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            throw new Error(`2FA Login failed with status ${res.status}`);
        }

        return res.json();
    },

    register: async (name, surname, email, password) => {
        const res = await fetch(`${URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, surname, email, password })
        });

        if (!res.ok) {
            throw new Error(`Registration failed with status ${res.status}`);
        }

        return res.json();
    },

    loginWithGoogle: async (credential) => {
        const res = await fetch(`${URL}/api/auth/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token: credential })
        });

        if (!res.ok) {
            throw new Error(`Google Login failed with status ${res.status}`);
        }

        return res.json();
    },

    loginWithGithub: async (code) => {
        const res = await fetch(`${URL}/api/auth/github`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code })
        });

        if (!res.ok) {
            throw new Error(`GitHub Login failed with status ${res.status}`);
        }

        return res.json();
    }

}

export default authAPI;
