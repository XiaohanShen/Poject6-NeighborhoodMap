//This function is invoked as the callback of google map API.
var loadView = function loadView() {
	// Custom binding for the search bar
	ko.bindingHandlers.mapMarks = {
		//init Google Map 
		init: function(element, valueAccessor) {
			googleMap.init(element);
		},
		//update the markers once textInput changed
		update: function(element, valueAccessor) {
			var filteredItems = valueAccessor();
			googleMap.dropMarkers(filteredItems);
		}
	};
	ko.applyBindings(new KoViewModel());
};

// wrapping the google map related functions in this scope.
var googleMap = function() {
	var map;
	var markers = [];

	var locations = [{
		name: "Bund Clock Tower",
		lat: 31.236346,
		lng: 121.490082,
		icon: 'icon/noun_39409.svg',
		tags: '上海 海关大楼',
		description: "Completed in 1927, the 79-meter high clock tower is the highest in Asia, and the third highest in the world, after London's Big Ben and Moscow's Kremlin clock tower.nestled on top of the custom house on Shanghai's Bund"
	}, {
		name: "Yu Garden",
		lat: 31.227144,
		lng: 121.492175,
		icon: 'icon/noun_90801.svg',
		tags: 'Yu Garden',
		description: "First built in 1559,located in the center of Shangai. Famous for its dumplings and folk-custom lantern party."

	}, {
		name: "Shanghai Tower",
		lat: 31.233500,
		lng: 121.505780,
		icon: 'icon/noun_333880_cc.svg',
		tags: '上海中心',
		description: "Topped out on 3 August 2013, 632 metres (2,073 ft) high which is 2nd tallest in the world."
	}, {
		name: "Jin Mao Tower",
		lat: 31.235178,
		lng: 121.505996,
		icon: 'icon/noun_334847_cc.svg',
		tags: '金茂大厦',
		description: "420.5 metres (1,380 feet) tall. Its inspiration comes from chinese pagoda."
	}, {
		name: "Shanghai World Financial Centre",
		lat: 31.234676,
		lng: 121.507858,
		icon: 'icon/noun_4825_cc.svg',
		tags: '上海环球金融中心',
		description: " Full height of 492 m (1,614 ft).Chinese alike informally refer to the building as 'the bottle opener'."
	}, {
		name: "Oriental Pearl Tower",
		lat: 31.239891,
		lng: 121.499745,
		icon: 'icon/noun_6051_cc.svg',
		tags: 'Oriental Pearl Tower',
		description: "Completed on Oct. 1, 1994. It is 468 m high. The structure of the tower consists of 11 spheres, different in sizes and arranged at different levels.It expresses the artistic concept of 'pearls, big and small, dropping on a jade plate'."
	}];

	// Create a google map infowindow in the scope of googleMap.
	// Singleton pattern is used to make sure google map API is invoked after API loaded. 
	var infoWinSingleton = (function() {
		var instance;
		function init() {
			var privateInstance = new google.maps.InfoWindow();
			return privateInstance;
		}
		return {
			getInfoWin: function() {
				if (!instance) {
					instance = init();
				}
				return instance;
			}
		};
	})();

	function initMap(mapDiv) {
		map = new google.maps.Map(mapDiv, {
			center: {
				lat: 31.238780,
				lng: 121.498169
			},
			zoom: 14
		});
	}

	//bounce the mark when user click the list in the nav bar.
	function toggleBounce(location) {
		markers.forEach(
			function(marker) {
				if (marker.getAnimation() !== null) {
					marker.setAnimation(null);
				}
				if (Math.abs(location.lat - marker.position.lat()) < 1E-6 && Math.abs(location.lng - marker.position.lng())) {
					google.maps.event.trigger(marker, 'click');
				}
			}
		);
	}

	function drop(locations) {
		clearMarkers();
		for (var i = 0; i < locations.length; i++) {
			addMarkerWithTimeout(locations[i], i * 200);
		}
	}

	function addMarkerWithTimeout(location, timeout) {
		var latlng = new google.maps.LatLng(location.lat, location.lng);
		window.setTimeout(function() {
			var marker = new google.maps.Marker({
				position: latlng,
				map: map,
				icon: location.icon,
				animation: google.maps.Animation.DROP
			});
			attachMarkContent(marker, location);
			markers.push(marker);
		}, timeout);
	}

	function attachMarkContent(marker, location) {
		var infoWin = infoWinSingleton.getInfoWin();
		// infoWin.close();
		marker.addListener('click', function() {
			marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				marker.setAnimation(null);
			}, 1500);
			openInfoWin(location, infoWin, marker);
		});
	}

	function clearMarkers() {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
	}

	// use ajax to get related flickr photo according the tags given. 
	// Open the info window.
	function openInfoWin(location, infowindow, marker) {
		var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
		$.getJSON(flickerAPI, {
			tags: location.tags,
			tagmode: "any",
			format: "json"
		})
			.done(function(data) {
				var randomInt = Math.floor(Math.random() * (data.items.length - 1));
				var imgUrl = data.items[randomInt].media.m;
				var formattedInfoWindow = "<h3>" + location.name + "</h3>" + "<img src='" + imgUrl + "'/>" + "<p style='max-width:20em;'>" + location.description + "</p>";
				infowindow.setContent(formattedInfoWindow);
				infowindow.open(marker.get('map'), marker);
			})
			.fail(function() {
				alert("Fails to connect to flickr");
			});
	}

	return {
		locations: locations,
		dropMarkers: drop,
		init: initMap,
		toggleBounce: toggleBounce
	};
}();

function KoViewModel() {
	var self = this;

	self.locations = ko.observableArray(googleMap.locations);
	self.search = ko.observable(""); // User input in search bar
	self.filteredItems = ko.computed(function() {
		var filter = self.search().toLowerCase();
		if (!filter) {
			return self.locations();
		} else {
			return ko.utils.arrayFilter(self.locations(), function(item) {
				var str = item.name.toLowerCase();
				return str.search(filter) >= 0;
				//return the observable array of locations that matching with the user input
			});
		}
	});
}