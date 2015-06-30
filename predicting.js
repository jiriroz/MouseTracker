
var mouseX;
var mouseY;
var clickX;
var clickY;
document.onmousemove = function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}
var CLICKED = false;

/*parameters for estimating next click
theta: threshold value
tau: decay rate
h: increase of probability form hovering
b,d,f: parameters for the distance function
*/
var PARAMS = {"theta":0.9, "tau":0.99, "eta":0.4, "beta":2, "alpha":40.0, "lambda":0.0};

var PROBABILITIES = [];
var HOVERED = [];
for (var i = 0; i < document.getElementsByTagName("a").length; i++) {
    PROBABILITIES.push(0);
    HOVERED.push(false);
}

//Iterate over links.
window.setInterval(function(){
    var links = document.getElementsByTagName("a");
	if (!PAUSE) {
		for (var i = 0; i < links.length; i++) {
			if (PROBABILITIES[i] < 1.0e-5) {
				PROBABILITIES[i] = 0;
			}
			if (PROBABILITIES[i] > PARAMS["theta"]) {
				clickLink(links[i]);
				console.log("clicked " + i);
				PROBABILITIES[i] = 0;
			}
			if (HOVERED[i]) {
				PROBABILITIES[i] += PARAMS["eta"];
				HOVERED[i] = false;
			}
			if (CLICKED) {
				PROBABILITIES[i] += handleClick(links[i]);
			}
			PROBABILITIES[i] *= PARAMS["tau"];
		}
		CLICKED = false;
	}
}, 50);

//return the value by which the probability should increase
var handleClick = function (element) {
    var dist = getDistanceToElement([clickX,clickY], element);
    var score = PARAMS["alpha"] / Math.pow(dist,PARAMS["beta"]) + PARAMS["lambda"];
    return score;
};

var getDistanceToElement = function (click, element) {
    var rect = element.getBoundingClientRect();
    var x = click[0];
    var y = click[1];
    var dist;
    if (x < rect["left"] && y < rect["top"]) {
        dist = getDistance(click,[rect["left"],rect["top"]]);
    } else if (x > rect["right"] && y < rect["top"]) {
        dist = getDistance(click,[rect["right"],rect["top"]]);
    } else if (x > rect["right"] && y > rect["bottom"]) {
        dist = getDistance(click,[rect["right"],rect["bottom"]]);
    } else if (x < rect["left"] && y > rect["bottom"]) {
        dist = getDistance(click,[rect["left"],rect["bottom"]]);
    } else if (y < rect["top"]) {
        dist = rect["top"] - y;
    } else if (x > rect["right"]) {
        dist = x - rect["right"];
    } else if (y > rect["bottom"]) {
        dist = y - rect["bottom"];
    } else if (x < rect["left"]) {
        dist = rect["left"] - x;
    } else {
        dist = 100000;
    }
    return dist;
};

var getDistance = function (p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) +
                     Math.pow(p1[1] - p2[1], 2));
};

var clickLink = function (element) {
	for (var i = 0; i < PROBABILITIES.length; i++) {
		PROBABILITIES[i] = 0;
	}
    element.click();
};

/*jQuery*/
$(document).ready(function(){
    $(document).click(function(){
        CLICKED = true;
        //store for better precision
        clickX = mouseX;
        clickY = mouseY;
    });
    $.each($("a"), function(index,value) {
        $(this).hover(function(){
            //on enter
            HOVERED[index] = true;
            }, function(){
            //on leave
        });
    });
});
