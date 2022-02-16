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

};

export default new DataService(); 