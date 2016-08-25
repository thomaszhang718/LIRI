//Adding variables for fs, request, spotify, and twitter packages to use their APIs
var fs = require('fs');
var request = require('request');
var spotify = require('spotify');
var Twitter = require('twitter');

//Adding variable for action, which selects what function we'll run
var action = process.argv[2];

//Storing all arguments as an array, then using a for loop to push the ones we want to "do something to" into an array
var argArray = process.argv;
var valueArray = [];

for (i = 3; i < argArray.length; i++) {
	valueArray.push(argArray[i]);
}

//Creating a function that contains all our switch cases
function switchFunction(actionParam) {

	//4 switch cases for tweets, spotify, omdb, do what it says, plus a default message
	switch(actionParam) {
		case 'my-tweets':
		twitterFunction();
		break;

		case 'spotify-this-song':
		spotifyFunction();
		break;

		case 'movie-this':
		OMDBFunction();
		break;

		case 'do-what-it-says':
		dwisFunction();
		break;	

		default:
		console.log('You did not enter a valid action. Please choose between the following: my-tweets, spotify-this-song, movie-this, do-what-it-says');
		break;
	};

}

//This function accesses my Twitter account through their API and shows the last 20 tweets and date created in my command window
function twitterFunction() {

	//Getting twitter keys from separate file
	var twitterKeys = require('./keys.js').twitterKeys;

	var client = new Twitter(twitterKeys);

	//Adding a count of 20 to parameters
    var params = {screen_name: 'yoshistories', count: 20};
    var tweetText = '';
    var tweetTime = '';

    //calling Twitter API to get tweets from my account
    client.get('statuses/user_timeline', params, function(error, tweets, response) {

    	//If no error and response code returns good, use a for loop to print the last 20 tweets and time created
    	if (!error && response.statusCode == 200) {
	        for (var i = 0; i < 20; i++) {
	        	tweetText = tweets[i].text;
	        	tweetTime = tweets[i].created_at;

	        	console.log(tweetText + ' posted at ' + tweetTime);
	        }
    	}

    	//Check if error, then console log it
    	else if (error) {
	        console.log('Error occurred: ' + err);
	        return;
    	}
    });
};

//This function searches the song title in the spotify API then displays some track info
function spotifyFunction() {

	//Spotify API search uses one string with spaces for song name so we join the arguments containing the song name into one string
	valueName = valueArray.join(' ');

	//Check to make sure a song title was provided. If non was provided, set a default search for the Blink-182 song "All The Small Things"
	if (process.argv[3] == undefined) {
		//console.log('NO SONG SEARCHED');
		valueName = 'All The Small Things';
	}

	//Calling spotify API with a search query of the valueName, which should be the title of the song from parameters
	spotify.search({ type: 'track', query: valueName }, function(error, data) {

		//Check if error, then console log it
	    if (error) {
	        console.log('Error occurred: ' + err);
	        return;
	    }

	    //If no error, then display some information on the song
	 	else {
	 		console.log('Artist: ' + data.tracks.items[0].artists[0].name);
	 		console.log('Song Name: ' + data.tracks.items[0].name);
	 		console.log('Spotify Preview URL: ' + data.tracks.items[0].preview_url);
	 		console.log('Album: ' + data.tracks.items[0].album.name);
	 	}
	});
};

//This function searches the movie title in the OMDB API then displays some movie info
function OMDBFunction() {

	//OMDB API search uses one string with + for song name so we join the arguments containing the movie name into one string with the + character
	valueName = valueArray.join('+');

	//Check to make sure a movie title was provided. If non was provided, set a default search for the Korean film "My Sassy Girl"
	if (process.argv[3] == undefined) {
		//console.log('NO MOVIE SEARCHED');
		valueName = 'My+Sassy+Girl';
	}

	//Create the querlUrl adding in the correctly formatted movie title
	var queryUrl = 'http://www.omdbapi.com/?t=' + valueName +'&y=&plot=short&tomatoes=true&r=json';

	//Call the OMDB API
	request(queryUrl, function(error, response, data) {

		//If no error and response code returns good
		if (!error && response.statusCode == 200) {

			//Store the data as a JSON object
			var jsonObject = JSON.parse(data);

			//Display some movie information to command window
			console.log('Movie Title: ' + jsonObject.Title);
			console.log('Year Released: ' + jsonObject.Year);
			console.log('IMDB Rating: ' + jsonObject.imdbRating);
			console.log('Country where movie was produced: ' + jsonObject.Country);
			console.log('Language of movie: ' + jsonObject.Language);
			console.log('Plot of movie: ' + jsonObject.Plot);
			console.log('Actors in movie: ' + jsonObject.Actors);
			console.log('Rotten Tomatoes Rating: ' + jsonObject.tomatoUserRating);
			console.log('Rotten Tomatoes URL: ' + jsonObject.tomatoURL);
		}

		//Check if error, then console log it
    	else if (error) {
	        console.log('Error occurred: ' + err);
	        return;
    	}
	});
};

//This function reads the random.txt file and follows the instructions in the file, which could be using the Twitter, Spotify, or OMDB API
function dwisFunction() {

	//Using fs to read random.txt which is to spotify-this-song,"I Want it That Way". random2.txt and random3.txt use the OMDB and Twitter APIs, respectively.
	fs.readFile('random.txt', 'utf8', function(error, data) {

		//Split the file to the action and then the possible movie title or song name using the "," character
		var dataArr = data.split(',');

		//Setting the action variable to the new action which is currently spotify-this-song
		action = dataArr[0];

		//If the action variable is my-tweets, then just run the switchFunction right after
		if (action == 'my-tweets') {
			//Passing in the new action variable we got from random.txt into switchFunction which will then run twitterFunction
			switchFunction(action);
		}

		//If not using Twitter, we then need to store the provided movie title or song name
		else {
			//I had to manipulate the string to remove the " character and then add the words into an array, since the functions are all set up to start with an array
			var newValueArray = dataArr[1];
			newValueArray = dataArr[1].split('"').join('').split(' ');

			//We then set up valueArray to the correctly formatted newValueArray
			valueArray = newValueArray;
			
			//I needed to make process.argv[3] equal to an empty string since we haven't passed in an argument, but do have song names and movie titles. My functions check process.argv[3] to see if there was one provided
			process.argv[3] = '';

			//Passing in the new action variable we got from random.txt into switchFunction which will then run either OMDBFunction or spotifyFunction
			switchFunction(action);
		};
	});
};

//Call switchFunction
switchFunction(action);