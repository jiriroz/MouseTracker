/*
Mouse click predicting experiment.
*/

var ABORTED = false;
var PAUSE = false;

var Experiment = function(start, finish) {
	this.times = [];
    var htmllinks = document.getElementsByTagName("a");
	//disable all links
	for (var i = 0; i < htmllinks.length; i++) {
		htmllinks[i].href = "#";
		htmllinks[i].onclick = this.abortTrial;
	}
	this.links = Array.prototype.slice.call(htmllinks);
    this.links = this.links.slice(start, finish);
	this.curlink = this.links[0];
	this.curI = 0;
    this.trialTime = 5000;
    this.pauseTime = 1500;
    this.nTrials = 10;
    this.trialNum = 0;
    this.results = [];
    this.hit = false;
};

Experiment.prototype.begin = function () {
    this.trial();
};

Experiment.prototype.trial = function () {
	PAUSE = false;
    if (this.trialNum > 0) {
        this.results.push(this.hit);
    }
    if (this.trialNum < this.nTrials) {
        var expr = this;
        window.setTimeout(function() {
            expr.pause();
        }, this.trialTime);
    } else {
        this.end();
        return;
    }
    this.trialNum++;
    this.hit = false;
    //randomly choose a link
    var i = Math.floor(Math.random() * this.links.length);
	this.curI = i;
	console.log("Number " + i);
    this.curLink = this.links[i];
    this.curLink.onclick = this.clickLink;
    this.curLink.style["background-color"] = "red";
};

Experiment.prototype.pause = function () {
	for (var i=0; i<PROBABILITIES.length; i++) {
		PROBABILITIES[i] = 0;
	}
	PAUSE = true;
	ABORTED = false;
    this.curLink.onclick = this.abortTrial;
    this.curLink.style["background-color"] = "transparent";
    var expr = this;
    window.setTimeout(function() {
        expr.trial();
    }, this.pauseTime);
};

Experiment.prototype.end = function () {
    this.curLink.onclick = this.abortTrial;
    this.curLink.style["background-color"] = "transparent";
    console.log(this.results);
	console.log(this.times);
};

//callback for highlighted link
Experiment.prototype.clickLink = function (event) {
	if (!ABORTED) {
        EXPERIMENT.hit = true;
        this.style["background-color"] = "green";
	}
};

//callback for all other links
Experiment.prototype.abortTrial = function (event) {
	//EXPERIMENT.curlink.onclick = EXPERIMENT.abortTrial;
	ABORTED = true;
};

//News is 4
//Svenska is 96
var EXPERIMENT = new Experiment(4,96);

window.onkeydown = function (e) {
	var key = e.keyCode ? e.keyCode : e.which;
	if (key == 13) {
	    EXPERIMENT.begin();
	}
}
