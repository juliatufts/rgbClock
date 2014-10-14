;(function() {
	var Clock = function(canvasId) {
		var canvas = document.getElementById(canvasId);
		var screen = canvas.getContext('2d');
		var size = {x: canvas.width, y: canvas.height};

		var self = this;
		var tick = function() {
			self.draw(screen, size);
			requestAnimationFrame(tick);
		};

		tick();
	};	

	Clock.prototype = {
		draw: function(screen, size, time) {

			// initialize variables
			var center = {x: size.x/2, y: size.y/2};
			var radius = 200;
			var hours, minutes, seconds;
			var currentDate = new Date();
			var displayHands = false;

			// assigns the current time to hours, minutes and seconds
			// and scales them to be in range (0,60)
			function updateTime(){
				hours = (currentDate.getHours() % 12) * 5;
				minutes = currentDate.getMinutes();
				seconds = currentDate.getSeconds();
			}

			// converts a time value (0, 60) to radians
			function timeToRad(timeValue){
				// normalize timeValue and scale by 2 pi
				var adjustedTime = (timeValue/60) * 2 * Math.PI;
				// final value accounts for cos(0),sin(0) starting at the 15 minute mark
				return adjustedTime - (Math.PI / 2);
			}

			// draws a color arc from start to end, both in range (0, 60)
			function drawArc(screen, startValue, endValue, handLength, color){
				// convert to radians
				var start = timeToRad(startValue);
				var end = timeToRad(endValue);

				// draw the arc
				screen.beginPath();
				screen.moveTo(center.x, center.y);
		      	screen.arc(center.x, center.y, handLength, start, end, false);
		      	screen.fillStyle = color;
		      	screen.fill();
		      	screen.closePath();
			}

			// draws a color arc corresponding to the seconds
			function drawSecondArc(screen, handLength){
				drawArc(screen, 0, seconds, handLength, "rgba(0, 0, 255, 1)");
			}

			// draws a color arc corresponding to the minutes
			function drawMinuteArc(screen, handLength){
				// draw an arc from 12 o' clock mark to the given time value
				// partitioned into at most two pieces depending on what the seconds value is
				if(seconds <= minutes){	
					drawArc(screen, 0, seconds, handLength, "rgba(0, 255, 255, 1)");		
			      	drawArc(screen, seconds, minutes, handLength, "rgba(0, 255, 0, 1)");
		      	} else {
		      		drawArc(screen, 0, minutes, handLength, "rgba(0, 255, 255, 1)");
		      	}
			}

			// draws a color arc corresponding to the hours
			function drawHourArc(screen, handLength){
				// draw an arc from 12 o' clock mark to the given time value
				// partitioned into at most three pieces depending on 
				// what the seconds and minutes values are
				if(minutes <= hours){
					if(seconds <= minutes){
						drawArc(screen, 0, seconds, handLength, "rgba(255, 255, 255, 1)");		
				      	drawArc(screen, seconds, minutes, handLength, "rgba(255, 255, 0, 1)");
				      	drawArc(screen, minutes, hours, handLength, "rgba(255, 0, 0, 1)");
					} else if(seconds <= hours) {
						drawArc(screen, 0, minutes, handLength, "rgba(255, 255, 255, 1)");		
				      	drawArc(screen, minutes, seconds, handLength, "rgba(255, 0, 255, 1)");
				      	drawArc(screen, seconds, hours, handLength, "rgba(255, 0, 0, 1)");
					} else {
						drawArc(screen, 0, minutes, handLength, "rgba(255, 255, 255, 1)");		
				      	drawArc(screen, minutes, hours, handLength, "rgba(255, 0, 255, 1)");
					}
		      	} else {
		      		if(seconds <= hours){		
						drawArc(screen, 0, seconds, handLength, "rgba(255, 255, 255, 1)");		
				      	drawArc(screen, seconds, hours, handLength, "rgba(255, 255, 0, 1)");
					} else {
						drawArc(screen, 0, hours, handLength, "rgba(255, 255, 255, 1)");
					}
		      	}
			}

			// draws a hand corresponding to a time value in range (0, 60)
			function drawHand(screen, timeValue, handLength){
				//convert to radians
				var theta = timeToRad(timeValue);

				// draw a line from the center corresponding to the time
				screen.beginPath();
		      	screen.moveTo(center.x, center.y);
		      	screen.lineTo(center.x + handLength*Math.cos(theta), center.y + handLength*Math.sin(theta));
		      	screen.strokeStyle = '#000000';
		      	screen.stroke();
		      	screen.closePath();
			}

			// draws notches on the perimeter of a circle with given center and radius
			function drawNotches(screen, x, y, radius, length){
				screen.strokeStyle = '#000000';
				var n = 60;
				var theta;
				for(var i = 0; i < n; i+=5){
					theta = i*2*Math.PI/n;
					screen.beginPath();
			      	screen.moveTo(center.x + (radius-length)*Math.cos(theta), center.y + (radius-length)*Math.sin(theta));
			      	screen.lineTo(center.x + radius*Math.cos(theta), center.y + radius*Math.sin(theta));
			      	screen.stroke();
			      	screen.closePath();
				}
			}

			//------------------------------- MAIN --------------------------------//
			updateTime();

	      	// Clear the screen
			screen.clearRect(0, 0, size.x, size.y);
			// background is black
			screen.fillRect(0, 0, size.x, size.y);

			//------------------------- DRAW CLOCK --------------------------//
			// outline
		 	screen.beginPath();
	      	screen.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
	      	screen.fillStyle = '#FFFFFF';
	      	screen.fill();
	      	screen.lineWidth = 2;
	      	screen.strokeStyle = '#000000';
	      	screen.stroke();
	      	screen.closePath();
	      	// notches
	      	drawNotches(screen, center.x, center.y, radius, 5);

	      	//// color arcs
	      	// seconds
	      	drawSecondArc(screen, radius - 20);
	        // minutes
	      	drawMinuteArc(screen, radius - 40);
	      	// hours
	      	drawHourArc(screen, radius - 100);

	      	// Optional draw hands
	      	if(displayHands){
		      	drawHand(screen, seconds, radius - 20);
		      	drawHand(screen, minutes, radius - 40);
		      	drawHand(screen, hours, radius - 100);
	      	}

	      	// center point (on top of color arcs)
	      	screen.beginPath();
	      	screen.arc(center.x, center.y, 3, 0, 2 * Math.PI, false);
	      	screen.fillStyle = '#000000';
	      	screen.fill();
	      	screen.closePath();
		}
	};

	window.onload = function() {
		new Clock("canvas");
	};
})();