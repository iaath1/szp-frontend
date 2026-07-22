const URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

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
    }

}

export default authAPI;
