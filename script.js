var client_id, client_secret;
// var access_token = '';

// $.ajax({
// 	url: 'keys.json',
// 	dataType: 'json',
// 	success: function (data) {

// 		client_id = data.client_id;
// 		client_secret = data.client_secret;
// 	}
// });

var client_id = '1322cb757caf472baf15032e3f12bbe7';
var client_secret = '52e91bce710e4325b75b5aa4e87c0bb5';
var access_token = '';

function Spotify() {
	this.apiUrl = 'https://api.spotify.com/';
}

//Search for information on an artist, adding the possibility of obtaining their albums.
Spotify.prototype.getArtist = function (artist) {
	$('.container2').empty();
	$('.container1').empty();

	artist = encodeURIComponent(artist);
	$.ajax({
		type: "GET",
		url: this.apiUrl + 'v1/search?type=artist,track&q=' + artist,
		headers: {
			'Authorization': 'Bearer ' + access_token
		},
	}).done(function (response) {
		if (response.artists.items.length == 0) {
			$('.container1').append("<h2>No artists found</h2>");
		} else {
			$('.container1').append("<h3>Artists:</h3>");
			response.artists.items.forEach(item => {
				$('.container1').append(`<div class='artist' data-id='${item.id}'><p>${item.name}</p><img src='${item.images[0].url}'><h2>Popularity: ${item.popularity}</h2></div>`);
			});
		}

		if (response.tracks.items.length == 0) {
			$('.container2').append("<h2>No songs found</h2>");
		} else {
			$('.container2').append(`<h3>Songs:</h3>`);
			printSongs(response.tracks);
		}
	});
};

//Search the albums of an artist, given the id of the artist
Spotify.prototype.getArtistById = function (artistId, artistName) {

	$.ajax({
		type: "GET",
		url: this.apiUrl + 'v1/artists/' + artistId + '/albums',
		headers: {
			'Authorization': 'Bearer ' + access_token
		},
	}).done(function (response) {
		// console.log(response);
		$('.container1').empty();
		$('.container1').append(`<h3>${artistName} Albums:</h3>`);
		response.items.forEach(item => {
			$('.container1').append(`<div class='album' data-id='${item.id}'><p>${item.name}</p><img src='${item.images[0].url}'></img></div>`);
		});
	});
};


Spotify.prototype.getAlbumTracks = function (albumId, albumName, image) {

	$.ajax({
		type: "GET",
		url: this.apiUrl + 'v1/albums/' + albumId + '/tracks',
		headers: {
			'Authorization': 'Bearer ' + access_token
		},
	}).done(function (response) {

		$('.container2').empty();
		$('.container2').append(`<h3>Album's songs:<br> ${albumName}:</h3>`);

		printAlbumSongs(response, image);
	});
};

function printSongs(response) {
	if (response.items.length == 0) {
		$('.container2').append("<h2>No songs found</h2>");
	} else {

		response.items.forEach(item => {

			let artists = [];
			item.artists.forEach(artist => {
				artists += artist.name;
				artists += ", ";
			})
			artists = artists.slice(0, -2);


			if (item.preview_url != null) {
				$('.container2').append(`<div class='big-song song' data-id='${item.id}'>
			<p>${item.name}</p>
			<img src='${item.album.images[0].url}'></img>
			<p>Artists: ${artists}</p>
			<audio controls>
				<source src='${item.preview_url}' type='audio/mp3'>
			</audio>
			</div>`);
			} else {
				$('.container2').append(`<div class='big-song song' data-id='${item.id}'>
			<p>${item.name}</p>
			<img src='${item.album.images[0].url}'></img>
			<p>Artists: ${artists}</p>
			<h5>No preview available</h5>
			</div>`);
			}
		});
	}
}


function printAlbumSongs(response, image) {
	response.items.forEach(item => {

		let artists = [];
		item.artists.forEach(artist => {
			artists += artist.name;
			artists += ", ";
		})
		artists = artists.slice(0, -2);


		if (item.preview_url != null) {
			$('.container2').append(`<div class='small-song song' data-id='${item.id}'>
			<img src='${image}'></img>
			<div class='right-content'>
			<p>${item.name}</p>
			<p>Artists: ${artists}</p>
			<audio controls>
				<source src='${item.preview_url}' type='audio/mp3'>
			</audio>
			</div>
			</div>`);
		} else {
			$('.container2').append(`<div class='small-song song' data-id='${item.id}'>
			<img src='${image}'></img>
			<div class='right-content'>

			<p>${item.name}</p>
			<p>Artists: ${artists}</p>
			<h5>No preview available</h5>
			</div>
			</div>`);
		}
	});
}


Spotify.prototype.showSongInfo = function (songId) {

	$.ajax({
		type: "GET",
		url: this.apiUrl + 'v1/tracks/' + songId,
		headers: {
			'Authorization': 'Bearer ' + access_token
		},
	}).done(function (response) {
		$('.container1').empty();
		$('.container1').append(`<div class='song-info'><h3>${response.name}</h3>
		<img src='${response.album.images[0].url}'></img>
		<h3>Artists: ${response.artists[0].name}</h3>
		<h3>Album: ${response.album.name}</h3>
			<h3>Popularity: ${response.popularity}</h3>
		
		
		</div>`);
	});

}





//This fragment is the first thing that is loaded, when the $(document).ready
$(function () {
	$.ajax({
		type: "POST",
		url: "https://accounts.spotify.com/api/token",
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_secret));
		},
		dataType: "json",
		data: { grant_type: "client_credentials" }
	}).done(function (response) {
		access_token = response.access_token;
	});

	var spotify = new Spotify();
	$('#fieldSearch').val('').focus();


	$('#btnSearch').on('click', function () {
		spotify.getArtist($('#fieldSearch').val());
		// spotify.getSongs($('#fieldSearch').val());
	});

	$('.container1').on('click', '.artist', function () {
		spotify.getArtistById($(this).attr("data-id"), $(this).find('p').text());
	});

	$('.container1').on('click', '.album', function () {
		spotify.getAlbumTracks($(this).attr("data-id"), $(this).find('p').text(), $(this).find('img').attr('src'));
	});

	$('.container2').on('click', '.song', function () {
		spotify.showSongInfo($(this).attr("data-id"));
		$(this).find('audio').get(0).play();
	});

	$('.logo').on('click', function () {
		$('.container1').empty();
		$('.container2').empty();
		$('#fieldSearch').val('').focus();
	});

});


document.addEventListener('keyup', event => {
	if (event.keyCode === 13) {
		$('#btnSearch').click();
	}
}, false)