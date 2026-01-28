/**
 * Authentication Service
 * Handles authentication logic using environment variables
 */

export class AuthService {
    static login(username, password) {
        const envUsername = import.meta.env.VITE_ADMIN_USERNAME;
        const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
        
        if (username === envUsername && password === envPassword) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify({ 
                email: username,
                role: 'admin',
                loginTime: new Date().toISOString()
            }));
            return { success: true, user: { email: username, role: 'admin' } };
        }
        
        return { success: false, error: 'Invalid credentials' };
    }
    
    static logout() {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
    }
    
    static isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }
    
    static getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    
    static getAuthHeaders() {
        const user = this.getCurrentUser();
        return user ? {
            'Authorization': `Bearer ${user.email}`,
            'X-User-Role': user.role
        } : {};
    }
}