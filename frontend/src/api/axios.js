import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
})

// Request interceptor for multi-tenancy
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser.organization_id) {
        config.headers['x-organization-id'] = parsedUser.organization_id;
      }
    } catch (e) {
      console.error("Error parsing currentUser from localStorage:", e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api