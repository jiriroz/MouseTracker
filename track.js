var CLICKS = [];
var MOVES = [];
var SCROLLS = [];

window.setInterval(function(){ //setTimeout also works
    var obj = {"clicks":CLICKS,"moves":MOVES,"scrolls":SCROLLS};
    post(JSON.stringify(obj));
    CLICKS = [];
    MOVES = [];
    SCROLLS = [];
}, 5000);

function post(data) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://localhost:8001", true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            str = xmlhttp.responseText;
            console.log(str);
        }
    }
    xmlhttp.send(data);
}

/*
handleClick and handleMove can either be properties
of the document or of an html element.
Need to be defined at parse time.
*/

/*
*/
function handleClick(event) {
    var x = event.clientX;
    var y = event.clientY;
    var t = (new Date()).getTime();
    storeClickCoords(x,y,t);
}

/*
Fired only when mouse moved.
At most 100 times per second.
*/
function handleMove(event) {
    var x = event.clientX; //event.pageX also works
    var y = event.clientY;
    var t = (new Date()).getTime();
    storeMoveCoords(x,y,t);
}

function handleScroll(event) {
    var t = (new Date()).getTime();
    storeScroll(t);
}

var storeClickCoords = function (x,y,t) {
    CLICKS.push([x,y,t]);
};

var storeMoveCoords = function (x,y,t) {
    MOVES.push([x,y,t]);
};

var storeScroll = function (t) {
    SCROLLS.push(t);
};
