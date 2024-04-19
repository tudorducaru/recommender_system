# FeedSupply

RSS feed reader that recommends users feeds they may be interested in based on what feeds the user has liked. The web interface of the system encompasses several functionalities, such as searching for feeds, liking/disliking feeds and viewing the entries of a feed. Moreover, the accompanying Chrome Extension can be used to automatically like a website's feed directly from the website. This is a University of Warwick Third Year Computer Science Project supervised by [Dr. Fayyaz Minhas](https://warwick.ac.uk/fac/sci/dcs/people/fayyaz_minhas/).

## Motivation

There are many feed reader applications, most of them with more (and better) features than FeedSupply. However, this project's focus was on providing accurate recommendations to users based on their preferences, a feature that is not present (as far as I know) in other feed readers.

This feature is important as it has become harder and harder for users to find content they may like. Social media and news aggregators provide content recommendations too, but they also take the user's control. 

By using FeedSupply, the user controls entirely what content they consume (the system does not and can not interfere with the actual content of RSS feeds). Rather, the system merely suggests users what they should follow, thus **facilitating content discovery in a noisy world**, but letting users make the final decisions as to what content they see.

## Technologies

The Machine Learning and back-end of the website have been developed using Python, with Flask as the server framework. This project takes advantage of the multitude of Python libraries available, such as *scikit-learn* and *numpy*. The front-end of the website has been developed using the React Javascript framework, while the Chrome Extension uses regular HTML, CSS and Javascript.

## Machine Learning

### Data Collection 

The **crawler.ipynb** file contains a web crawler that was used in order to collect the data required for this project, namely RSS feed URLs. The source of the data is [FeedSpot's blog](https://blog.feedspot.com/uk_rss_feeds/). Almost 70,000 feed URLs where collected. Furthermore, the crawler also collects and aggregates the title and description of a feed and the title and description of each of its entries.

### Feature Extraction

The **recommender.ipynb** represents the core ML script. It processes the data collected by the crawler and generates features for the feeds. Specifically, the body of text of each feed is converted into TF-IDF values.

### Making Recommendations

To recommend users feeds they may like, a user profile is constructed by averaging the feature vectors (TF-IDF representation) of the user's liked feeds. Then, the user is presented the closest feeds to that user profile (represented in the same feature space as the feeds) in terms of Euclidean distance.

## Summary of Files in Repo

### ml Folder

- **anchored_labels.npy**: hard assignments of feeds to topics generated by CorEx with anchored topics
- **anchored_word_clusters.npy**: assignments of words to each topic, as generated by CorEx with anchored topics
- **binary_matrix.npz**: doc-word matrix with binary counts (vectorized feeds); rows are the feeds and columns are the words
- **binary_words.npy**: list of the words representing the columns of the binary matrix
- **crawler.ipynb**: notebook that contains the code for the crawler; contains code both for collecting feed URLs and for collecting information about the feeds
- **tfidf_matrix.npz**: doc-word matrix with TF-IDF values (vectorized feeds); rows are the feeds and columns are the words
- **tfidf_words.npy**: list of the words representing the columns of the TF-IDF matrix
- **umap.ipynb**: notebood containing the rest of the code associated with the Machine Learning model; includes CorEx topic modelling, calculating distance between feeds etc.

### web Folder

- **app.py**: Flask API
- **gunicorn_config.py**: gunicorn configuration file (production deployment)
- **requirements.txt**: requirements for running the flask app
- **client/**: code of the React front-end client
- **ml_files/**: outputs of the ml algorithm (used to make the recommendations)

### web_extension Folder

- **feed_finder.js**: script that detects RSS feeds within a website
- **main.js**: main script of the extension
- **manifest.json**: extension's manifest file specifying metadata about the extension
- **popup.html & popup.css**: layout and design files of the extension's popup

## Installation Instructions

These instructions concern the web interface of this project on a Windows system. The ML files are regular Jupyter files that can be ran by simply running the desired cell (as long as all dependencies are installed).

### cd Into Web Directory

All files related to the web app are placed in the **web/** folder: `cd web`. Further installation instructions assume **web/** as the working directory.

### Copy the Database

Copy the **feeds.db** sqlite database into the working directory.

### Virtual Environment

Create a virtual environment within which to run the project: `python -m venv env`

You can start/stop the virtual environment using the following commands:
```
env\Scripts\activate.bat
deactivate
```

### Dependencies

Install the requirements of the web app. NOTE: **requirements.txt** contains the dependencies for the website. The ML files may need additional Python packages.

In the root folder of the project, run: `pip install -r requirements.txt`

### Add Environment Variables

Add a `.env` file (in the `web/` directory) and add the `JWT_SECRET_KEY` environment variable.

### Starting the Server

Start a flask development server.

```
flask run --debug
```

### Starting the React Client

cd into the **client/** folder, install Node.js packages and then start the React dev server:
```
npm install
npm run start
```

### Loading the Chrome Extension

In the **main.js** file, change the URL of the website to match the host you are running the server on (probably localhost:*port-no*). The host also needs to be added to the permissions in **manifest.json**.

Then, go to the *Manage Extensions* (chrome://extensions/) page on Chrome, activate Developer mode by clicking the switch in the top-right, click on the *Load unpacked* button and load the entire **web_extension** folder.

## Acknowledgements

This project represents an extension to David Ferreira's Third Year Project, FeedMe. FeedMe has been a valuable starting point for this project, providing inspiration for parts of the system, such as how to collect data as well as feature extraction.

## Deployment

The system has been deployed and is available at http://tudorducaru99.pythonanywhere.com/.
The Chrome Extension can be installed from the [Chrome Web Store](https://chrome.google.com/webstore/detail/feedsupply-assistant/lhmjggdmmikaoeplnfhbbbalcdclcfhb).



