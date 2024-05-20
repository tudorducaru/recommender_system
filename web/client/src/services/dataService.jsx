import axios from 'axios';

class DataService {

    // Get all words 
    async getWords() {
        try {

            const response = await axios.get(
                `/getWords`
            );
            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Get all feeds for the given page
    async getFeeds(page, searchTerm) {
        try {

            const response = await axios.get(
                `/getFeeds`,
                {
                    params: {
                        page,
                        searchTerm
                    }
                }
            );

            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Get all feeds liked by the user
    async getLikedFeeds() {
        try {

            const response = await axios.get(
                `/getLikedFeeds`
            );
            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Like a feed
    async likeFeed(feed_id) {
        try {

            const response = await axios.post(
                `/like`,
                { feed_id }
            );
            return;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Dislike feed
    async dislikeFeed(feed_id) {
        try {

            const response = await axios.post(
                `/dislike`,
                { feed_id }
            );
            return;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Get feeds recommended based on corex
    async getRecommendedFeedsCorex(page) {
        try {

            const response = await axios.get(
                `/recommend/corex`,
                {
                    params: {
                        page
                    }
                }
            );
            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Get feeds recommended based on tfidf
    async getRecommendedFeedsTfIdf(page) {
        try {

            const response = await axios.get(
                `/recommend/tfidf`,
                {
                    params: {
                        page
                    }
                }
            );
            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Get user's words
    async getUserWords() {
        try {

            const response = await axios.get(
                `/getUserWords`
            );
            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Update user's words
    async updateUserWords(words) {
        try {

            const response = await axios.post(
                `/updateWords`,
                { words }
            )

        } catch (err) {
            throw err.response.data;
        }
    }

    // Parse feed by ID
    async parseFeed(feedID) {
        try {

            const response = await axios.get(
                `/parseFeed/${feedID}`
            );

            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

    // Get similar feeds for a given feed ID
    async getSimilarFeeds(feedID) {
        try {

            const response = await axios.get(
                `/getSimilarFeeds/${feedID}`
            );

            return response.data;

        } catch (err) {
            throw err.response.data;
        }
    }

};

export default new DataService(); 