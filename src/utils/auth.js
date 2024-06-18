import { jwtDecode } from 'jwt-decode';

class AuthService {
    getProfile() {
        return jwtDecode(this.getToken());
    }

    loggedIn() {
        const token = this.getToken();
        return token && !this.isTokenExpired(token) ? true : false;
    }

    isTokenExpired(token) {
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
            localStorage.removeItem('id_token');
            localStorage.removeItem('services');
            localStorage.removeItem('admin_id');
            return true;
        }
        return false;
    }

    getToken() {
        return localStorage.getItem('id_token');
    }

    login(data) {
        localStorage.setItem('id_token', data.token);
        localStorage.setItem('admin_id', data.id);
    }

    logout() {
        localStorage.removeItem('id_token');
        localStorage.removeItem('services');
        localStorage.removeItem('admin_id');
    }
}

const auth = new AuthService();

export default auth;