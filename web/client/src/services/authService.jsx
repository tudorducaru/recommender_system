import axios from 'axios';

class AuthService {

    async register(userInfo) {
        try {

            await axios.post(
                `/register`,
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
                `/login`,
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
                `/verifyUser`,
            );
            return true;

        } catch (err) {
            return false;
        }
    }

    async logout() {
        try {

            await axios.post(
                `/logout`
            );
            return;

        } catch (err) {
            throw err;
        }
    }

};

export default new AuthService();