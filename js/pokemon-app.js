const MAP_SIZE = 800
const NU_CENTER = ol.proj.fromLonLat([-87.6753, 42.056])

// downtown center, uncomment to use downtown instead, or make your own
// const NU_CENTER = ol.proj.fromLonLat([-87.6813, 42.049])
const AUTOMOVE_SPEED = 1
const UPDATE_RATE = 100
/*
 Apps are made out of a header (title/controls) and footer
 and some number of columns
 If its vertical, the columns can become sections in one column
 */


let landmarkCount = 0

let gameState = {
	Total_CP: 0,
	stars: 0,
	captured: [],
	messages: []
}

let map = new InteractiveMap({
	mapCenter: NU_CENTER,

	// Ranges
	ranges: [500, 200, 90, 1], // must be in reverse order

	initializeMap() {
		// A good place to load landmarks
		this.loadLandmarks("landmarks-selected-nu", (landmark) => {
			// Keep this landmark?

			// Keep all landmarks in the set
			return true

			// Only keep this landmark if its a store or amenity, e.g.
			// return landmark.properties.amenity || landmark.properties.store
		})
		this.loadLandmarks("landmarks-selected-evanston", (landmark) => {
			// Keep this landmark?

			// Keep all landmarks in the set
			return true

			// Only keep this landmark if its a store or amenity, e.g.
			// return landmark.properties.amenity || landmark.properties.store
		})

		// this.loadLandmarks("landmarks-shop-nu", (landmark) => {
		// 	// Keep this landmark?

		// 	// Keep all landmarks in the set
		// 	return true

		// 	// Only keep this landmark if its a store or amenity, e.g.
		// 	// return landmark.properties.amenity || landmark.properties.store
		// })

		// Create random landmarks
		// You can also use this to create trails or clusters for the user to find
		for (var i = 0; i < 20; i++) {

			// make a polar offset (radius, theta) 
			// from the map's center (units are *approximately* meters)
			let position = clonePolarOffset(NU_CENTER, 600*Math.random() + 300, 20*Math.random())
			this.createLandmark({
				pos: position,
				name: words.getRandomWord(),
			})
		}
	},

	update() {
		// Do something each frame
	},

	initializeLandmark: (landmark, isPlayer) => {
		// Add data to any landmark when it's created

		// Any openmap data?
		if (landmark.openMapData) {
			console.log(landmark.openMapData)
			landmark.name = landmark.openMapData.name
			if (landmark.name == null){
				landmark.name = words.getRandomWord()
			}
		}
		
		// *You* decide how to create a marker
		// These aren't used, but could be examples
		landmark.idNumber = landmarkCount++
		landmark.color = [Math.random(), 1, .5]

		// Give it a random number of points
		landmark.points = Math.floor(Math.random()*10 + 1)
		landmark.stars = Math.round(Math.random())
		return landmark
	}, 

	onEnterRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user enters a range
		// -1 is not in any range

		console.log("enter", landmark.name, newLevel)
		if (newLevel == 2) {

			// Add points to my gamestate
			gameState.Total_CP += landmark.points
			gameState.stars += landmark.stars

			

			// Have we captured this?
			if (!gameState.captured.includes(landmark.name)) {
				gameState.captured.push(landmark.name)
				// Add a message
				gameState.messages.push(`You reach ${landmark.name} and gain ${landmark.points} Energy Points and ${landmark.stars} stars! `)
			}

		}
	},

	onExitRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user EXITS a range around a landmark 
		// e.g. (2->1, 0->-1)
		
		console.log("exit", landmark.name, newLevel)
	},
	
	
	featureToStyle: (landmark) => {
		// How should we draw this landmark?
		// Returns an object used to set up the drawing

		if (landmark.isPlayer) {
			return {
				icon: "person_pin_circle",
				noBG: true // skip the background
			}
		}
		
		// Pick out a hue, we can reuse it for foreground and background
		let hue = landmark.points*.1
		return {
			label: landmark.name + "\n" + landmark.distanceToPlayer +"m",
			fontSize: 8,

			// Icons (in icon folder)
			icon: "person_pin_circle",

			// Colors are in HSL (hue, saturation, lightness)
			iconColor: [hue, 1, .5],
			bgColor: [hue, 1, .2],
			noBG: false // skip the background
		}
	},

	
})



window.onload = (event) => {


	const app = new Vue({
		template: `
		<div id="app">
		<header></header>
		<h2>GOGO Evanston </h2>
		
			<div id="main-columns">

				<div class="main-column" style="flex:1;overflow:scroll;max-height:200px">
					<h4>Stop staying at room all day! Move around and try maximizing your energy points and even stars!</h4>
					</br>
					<h4>Total Energy Points: {{gameState.Total_CP}}</h4>
					<h4>Stars: {{gameState.stars}}</h4>
					<h4>Milestones: {{gameState.captured}}</h4>	
					<h4>Messages: {{gameState.messages}}</h4>	
					
				</div>

				<div class="main-column" style="overflow:hidden;width:${MAP_SIZE}px;height:${MAP_SIZE}px">
					<location-widget :map="map" />
				
				</div>

			</div>	
		<footer></footer>
		</div>`,

		data() {
			return {
			
				map: map,
				gameState: gameState
			}
		},

		// Get all of the intarsia components, plus various others
		components: Object.assign({
			// "user-widget": userWidget,
			// "room-widget": roomWidget,
			"location-widget": locationWidget,
		}),

		el: "#app"
	})

};

