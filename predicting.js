
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
t: threshold value
d: decay rate
h: increase of probabiility form hovering
b,d,f: parameters for the distance function
*/
var PARAMS = {"t":0.9, "d":0.96, "h":0.2, "b":2.5, "e":30.0, "f":0.0};

var PROBABILITIES = [];
var HOVERED = [];
for (var i = 0; i < document.getElementsByTagName("a").length; i++) {
    PROBABILITIES.push(0);
    HOVERED.push(false);
}

//track info
var CLICKS = [];
var MOVES = [];
var SCROLLS = [];
var LINKS_HOVERED = [];

//Send an ajax request every 5 seconds.
window.setInterval(function(){ //setTimeout also works
    var obj = {"clicks":CLICKS,"moves":MOVES,"scrolls":SCROLLS,
               "hovers":LINKS_HOVERED};
    post(JSON.stringify(obj));
    CLICKS = [];
    MOVES = [];
    SCROLLS = [];
    LINKS_HOVERED = [];
}, 5000);


//Print probabilities every 1 sec.
window.setInterval(function(){
    document.getElementById("output").innerHTML = PROBABILITIES[1];
}, 1000);

//Iterate over links.
window.setInterval(function(){
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        if (PROBABILITIES[i] < 1.0e-5) {
            PROBABILITIES[i] = 0;
        }
        if (PROBABILITIES[i] > PARAMS["t"]) {
            //clickLink(links[i]);
        }
        if (HOVERED[i]) {
            PROBABILITIES[i] += PARAMS["h"];
            HOVERED[i] = false;
        }
        if (CLICKED) {
            PROBABILITIES[i] += handleClick(links[i]);
        }
        PROBABILITIES[i] *= PARAMS["d"];
    }
    CLICKED = false;
}, 50);


function post(data) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://localhost:8001", true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            str = xmlhttp.responseText;
            //console.log(str);
        }
    }
    xmlhttp.send(data);
}

/*
storeClick and storeMove can either be properties
of the document or of an html element.
Need to be defined at parse time.
*/

/*
*/
function storeClick(event) {
    var x = event.clientX;
    var y = event.clientY;
    var t = (new Date()).getTime();
    CLICKS.push([x,y,t]);
}

/*
Fired only when mouse moved.
At most 100 times per second.
*/
function storeMove(event) {
    var x = event.clientX; //event.pageX also works
    var y = event.clientY;
    var t = (new Date()).getTime();
    MOVES.push([x,y,t]);
}

function storeScroll(event) {
    var t = (new Date()).getTime();
    SCROLLS.push(t);
}

function storeHover(index) {
    var t = (new Date()).getTime();
    LINKS_HOVERED.push([index,t]);
}

//return the value by which the probability should increase
var handleClick = function (element) {
    var dist = getDistanceToElement([clickX,clickY], element);
    var score = PARAMS["e"] / Math.pow(dist,PARAMS["b"]) + PARAMS["f"];
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
    }
    return dist;
};

var getDistance = function (p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) +
                     Math.pow(p1[1] - p2[1], 2));
};

var clickLink = function (element) {
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
            storeHover(index);
            HOVERED[index] = true;
            }, function(){
            //on leave
        });
    });
});
