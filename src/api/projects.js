const URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const projects = {
    getProjectsCount: async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${URL}/api/projects/count`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to get projects count with status ${res.status}`);
        }

        return res.json();
    },

    getTasksCount: async () => {
        const token = localStorage.getItem("token")
        const res = await fetch(`${URL}/api/tasks/count`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        if (!res.ok) {
            throw new Error(`Failed to get tasks count with status ${res.status}`)
        }

        return res.json();
    },
}

export default projects;