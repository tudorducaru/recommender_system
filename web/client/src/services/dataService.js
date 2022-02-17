import axios from 'axios';

const API_URL = 'http://localhost:5000';

class DataService {

    // Get all words 
    async getWords() {
        try {

            const response = await axios.get(
                `${API_URL}/getWords`
            );
            return response.data;

        } catch (err) {
            return err.response.data;
        }
    }

    // Get all feeds for the given page
    async getFeeds(page) {
        try {

            const response = await axios.get(
                `${API_URL}/getFeeds`,
                {
                    params: { page }
                }
            );

            return response.data;

        } catch (err) {
            return err.response.data;
        }
    }

};

export default new DataService(); 