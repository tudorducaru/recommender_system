import axios from 'axios';

const API_URL = 'http://localhost:5000'

class AuthService {

    async register(userInfo) {
        try {

            await axios.post(
                `${API_URL}/register`,
                userInfo,
            );
            return;

        } catch (err) {
            throw err.response.data;
        }
    }

    async login(email, password) {
        try {

            await axios.post(
                `${API_URL}/login`,
                {
                    email,
                    password
                });
            return;

        } catch (err) {
            throw err.response.data;
        }
    }

    async verifyUser() {
        try {

            await axios.get(
                `${API_URL}/verifyUser`,
            );
            return true;

        } catch (err) {
            return false;
        }
    }

    async logout() {
        try {

            await axios.post(
                `${API_URL}/logout`
            );
            return;

        } catch (err) {
            throw err;
        }
    }

};

export default new AuthService();