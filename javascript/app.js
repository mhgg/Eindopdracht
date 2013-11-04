//namespace > domready
var APP = APP || {};

//anonieme functie
(function () {

/* breakdown
- APP	
	- Settings
	- Controller
		- Init
		
	- Data
		- Post
	- Router
		- Ranking
		- Schedule
		- Game
		- All
	- Page
	- Directives
		- Schedule
	- Domready
*/

//settings
var loader = document.getElementById('circleG');
var mySwiper = new Swiper ('.swiper-container',{
	mode:'horizontal',
	loop: false
});
	
	// Controller Init
	APP.controller = {
		init: function () {
			// Initialize router
			// hier voert die router uit
			APP.router.init();
			APP.button.init();
		}
	};
	
	APP.button = {	
		init: function () {
			//nieuwe variabel die id submit pakt
			var button = document.getElementById('submit');	
			//functie bij klik
			button.addEventListener('click', function(){
			//zet lader op display block
			loader.style.display = 'block';
			
				//pakt waarden van input velden
				var value1 = document.getElementById('team1score').value;
				var value2 = document.getElementById('team2score').value;
				
				//logged de waarde van input velden
				console.log(value1);
				console.log(value2);
				
				//Get game_id
					//pakt url, maakt er een string van
					var url = window.location.toString();
					//split de url bij een slash
					var array = url.split("/");
					//van de hele array, pakt hij de achterste
					var game_id = array[array.length - 1];
					
					console.log(game_id);
					//post de scores
					
					//voert methode post uit
					APP.data.post({
						game_id: game_id,
						team_1_score: value1,
						team_2_score: value2,
						is_final: 'True'
					});
			});
		}
	}
	
	APP.data = {
		post: function(postData) {
            var url = 'https://api.leaguevine.com/v1/game_scores/';
			
			//maakt string van postdata
            var postData = JSON.stringify(postData);
			console.log(postData);
			
            // Create request
			//request naar bepaalde url
            var xhr = new XMLHttpRequest();
            xhr.open('POST',url,true);
			
			//Check for response
			//houd verbinding van request in de gaten, op moment dat verbinding is verandert, bij 4 = response terug, als die response 201 is voer uit
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && xhr.status == 201) {
						//Hide the loader
						loader.style.display = 'none';
						//voer router change uit
						APP.router.change('schedule');
						
					} else if (xhr.readyState == 4) {
						alert('Er is iets fout gegaan tijdens het posten');
				}
			};
			// Set request headers
			//aan te geven wat voor type die mee stuurt/ dit geval jason
            xhr.setRequestHeader('Content-type','application/json');
			//authorisatie van de post, met access token
            xhr.setRequestHeader('Authorization','bearer 82996312dc');
                        
            // Send request (with data as a json string)
            xhr.send(postData);
		},
	};

	// Router
	APP.router = {
		init: function () {
	  		routie({
			    '/game/:game_id': function(game_id) { // met : geef je een parameter mee aan routie die later gebruikt kan worden in page game
			    	APP.page.game(game_id);
				},
			    '/ranking': function() {
			    	APP.page.ranking();
					mySwiper.swipeTo(0,1000);
			    },

			    '/schedule': function() {
			    	APP.page.schedule();
					mySwiper.swipeTo(1,1000);
			    },
				'*': function() {
			    	APP.page.ranking();
					APP.page.schedule();
			    }
			});
		},

		change: function (section_name) {
            var sections = qwery('section'),
                section = qwery('[data-route=' + section_name + ']')[0];

            // Show active section, hide all other
            if (section) {
            	for (var i=0; i < sections.length; i++){
            		sections[i].classList.remove('active');
            	}
            	section.classList.add('active');
            }
		}
	};

	// Pages
	APP.page = {	
		game: function (game_id) {
			loader.style.display = 'block';
		promise.get('https://api.leaguevine.com/v1/games/'+game_id+'/?access_token=82996312dc').then(function(error, data, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				data = JSON.parse(data);
				console.log(data);
			
				Transparency.render(qwery('[data-route=game]')[0], data);
				APP.router.change('game');
				loader.style.display = 'none';
			});
		},

		schedule: function () {
		loader.style.display = 'block';
			promise.get('https://api.leaguevine.com/v1/games/?tournament_id=19389&access_token=82996312dc').then(function(error, data, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				//van parse maakt ie er een json object van
				data = JSON.parse(data);
				console.log(data);
			
				var directives = APP.directives.schedule;
				
				//rendert de data en de directives
				Transparency.render(qwery('[data-route=schedule]')[0], data, directives);
				APP.router.change('schedule');
				loader.style.display = 'none';
			});
		},

		ranking: function () {
		loader.style.display = 'block';
			promise.get('https://api.leaguevine.com/v1/pools/?tournament_id=19389&acces_token=82996312dc').then(function(error, data, xhr) {
				if (error) {
					alert('Error ' + xhr.status);
					return;
				}
				data = JSON.parse(data);
				console.log(data);
			
				Transparency.render(qwery('[data-route=ranking]')[0], data);
				APP.router.change('ranking');
				loader.style.display = 'none';
			});
		}
	}
	
	//Directives geven op moment van update score data bind tegen komt href mee waarin game id meegeeft
	APP.directives = {
		schedule: {
			objects: {
			//loopt af bij binden van de data
				update_score: {
					href: function() {
						return '#/game/' + this.id;
					}
				}
			}
		}
	}
	
	// DOM ready > controller
	domready(function () {
		// start van de applicatie wanneer content geladen is
		APP.controller.init();
	});
})();