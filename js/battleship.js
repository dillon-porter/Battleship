// The View Object

var view = {
	//this method takes a string and displays it
	// in the message display area
	displayMessage: function(msg) {
	 var messageArea = document.getElementById("messageArea");
	 messageArea.innerHTML = msg;
	},
	
	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit"); //We then set the class of that element to "hit." This will immediately add a ship image to the <td> element.
	},
	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss"); //This will immediately add the 'miss' image to the <td> element.
	}
};

// The model object

	var model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	
	ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],

// original hard-coded values for ship locations
/*
	ships: [
		{ locations: ["06", "16", "26"], hits: ["", "", ""] },
		{ locations: ["24", "34", "44"], hits: ["", "", ""] },
		{ locations: ["10", "11", "12"], hits: ["", "", ""] }
	],
*/

	fire: function(guess) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);

			// here's an improvement! Check to see if the ship
			// has already been hit, message the user, and return true.
			if (ship.hits[index] === "hit") {
				view.displayMessage("Oops, you already hit that location!");
				return true;
			} else if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("HIT!");

				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);
		view.displayMessage("You missed.");
		return false;
	},

	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++)  {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
	    return true;
	},

	generateShipLocations: function() { //For each ship we want to generate locations for.
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip(); //We generate a new set of locations.
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log("Ships array: ");
		console.log(this.ships);
	},

	generateShip: function() {
		var direction = Math.floor(Math.random() * 2); // Using Math.Random to generate a number between 0 and 1, and multiply the result by 2, to get a number between 0 and 2. We then turn that into 0 or 1 using Math.floor.
		var row, col;

		if (direction === 1) { // horizontal ship
			row = Math.floor(Math.random() * this.boardSize); //Here's the code to generate a starting location for the ship on the board.
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
		} else { // vertical ship
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = []; // For the new ship locations, we'll start with an empty array, and add the locations one by one.
		for (var i = 0; i < this.shipLength; i++) { // We'll loop for the number of locations in a ship
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i)); //horizontal ship... also pushing a new location onto the newShipLocations array. 
			} else {
				newShipLocations.push((row + i) + "" + col); //vertical ship and we're increasing the row instead of the column, adding i to the row each time through the loop.
			}
		}
		return newShipLocations; // Once we've filled the array with the ship's locations, we return it to the calling method, generateShipLocations
	},

	collision: function(locations) { // is an array of locations for a new ship we'd like to place on the board.
		for (var i = 0; i < this.numShips; i++) { //for each ship already on the board...
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; j++) { //check to see if any of the locations in the new ship's locations array are in an existing ship's location array.
				if (ship.locations.indexOf(locations[j]) >= 0) { //We're using indexOf to check if the location already exist in a ship, so if the index is greater than or equal to 0, we know it matched
																// an existing location, so we return true (meaning, we found a collision).
																
					return true; // Returning from inside a loop that's inside another loop stops the iteration of both loops immediately, exiting the function and returning true.
				}
			}
		}
		return false; // If we get here and haven't returned, then we never found a match for any of the locations we were checking so we return false (there was no collision)
	}
	
}; 
	//The controller object
	
	var controller = {  // Here we're defining our controller object,
						// with a property, guesses, intialized to zero.
		guesses: 0,
		
		processGuess: function(guess) { //Here's the beginning of the processGuess method, which takes a guess in the form of "A0".
		   var location = parseGuess(guess); // We'll use parseGuess to validate the player's guess.
			if (location) { //And as long as we don't get null back, we know we've got a valid location object. 
				this.guesses++; // If the player entered a valid guess, we increase the number of guesses by one. 
				var hit = model.fire(location); //Then we pass the row and column in the form of a strng to the model's fire method.  -- Returns true if ship is hit.
				if(hit && model.shipsSunk === model.numShips){ //If the guess was a hit, and the number of ships that are sunk is equal to the number of ships in the game, 
															  //then show the player a message that they’ve sunk all the ships.
															  
					view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses"); 
					// We’ll show the player the total number of guesses they took to sink the ships. The guesses property is a property of “this” object, the controller
				}
			}
		} 
	};
	
	// helper function to parse a guess from the user
	
	function parseGuess(guess) { //The guess is passed into the guess parameter.
	  var alphabet = ["A", "B", "C", "D", "E", "F", "G"]; // An array loaded with each letter that could be part of a valid guess.
		if (guess === null | guess.length !== 2) { // And then we check for null and to make sure the length is 2 characters.
			alert("Oops, please enter a letter and a number on the board."); //If not alert the player.
		} else {
			var firstChar = guess.charAt(0); //Grabs the first character of the guess.
			var row = alphabet.indexOf(firstChar); //Then using indexOf, we get back a number between zero and six that corresponds to the letter.
			var column = guess.charAt(1); // Here we've added code to grab the second character in the string, which represents the column.
			
			if(isNaN(row) || isNaN(column)) {
				alert("Oops, that isn't on the board.");
			} else if (row < 0 || row >= model.boardSize ||
								column < 0 || column >= model.boardSize) { // Ensuring the numbers are between zero and six. 
																		  //Also we're asking the model to tell us how big the board is and using that number for comparison.
				alert("Oops, that's off the board!");
			} else {
				return row + column; // We're concatenating the row and column together to make a string. We're using type conversion: row is a number and column is a string, so we'll end up with a string.
			}
		}
		return null; // If we get here, there was a failed check along with way, so return null. 
	}
	
	//Event Handlers
	
	function handleFireButton() { // Get's called when user clicks the fire button.
		var guessInput = document.getElementById("guessInput"); //We get a reference to the input form element using the input element’s id, “guessInput”.
		var guess = guessInput.value.toUpperCase();
		
		controller.processGuess(guess); //We’re passing the player’s guess to the controller, and then everything should work like magic!
		 
		guessInput.value = ""; //This little line just resets the form input element to be the empty string.

	}
	
	// Key press handler, It's called whenver you press a key in the form input.
	function handleKeyPress(e) {
		var fireButton = document.getElementById("fireButton");
		if (e.keyCode === 13) {
			fireButton.click();
			return false; //Return false so the form doesn't do anything else, like submit itself.
		}
	}
	
	window.onload = init;
	
	function init() {
		var fireButton = document.getElementById("fireButton");
		fireButton.onclick = handleFireButton;
		var guessInput = document.getElementById("guessInput");
		guessInput.onkeypress = handleKeyPress;
		
		model.generateShipLocations(); //fills the empty array in the model and we're calling this from the init function so it generate happens before you start playing.
	}
	
	


//For Testing//
/*view.displayMiss("00"); //A0
view.displayHit("34"); //D4
view.displayMiss("55"); //F5
view.displayHit("12"); //B2
view.displayMiss("25"); //C5
view.displayHit("26"); //C6

view.displayMessage("Is it working?");

model.fire("53"); // miss

model.fire("06"); // hit
model.fire("16"); // hit
model.fire("26"); // hit

model.fire("34"); // hit
model.fire("24"); // hit
model.fire("44"); // hit

model.fire("12"); // hit
model.fire("11"); // hit
model.fire("10"); // hit */

/*console.log(parseGuess("A0"));
console.log(parseGuess("B6"));
console.log(parseGuess("G3"));
console.log(parseGuess("H0"));
console.log(parseGuess("A7")); */

/*controller.processGuess("A0");
controller.processGuess("A6");
controller.processGuess("B6");
controller.processGuess("C6");
controller.processGuess("C4");
controller.processGuess("D4");
controller.processGuess("E4");
controller.processGuess("B0");
controller.processGuess("B1");
controller.processGuess("B2"); */

