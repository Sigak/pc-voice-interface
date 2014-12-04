var exec = require('child_process').exec;

function reactOn(speach) {
	drawTable(speach);
	findCommands(speach);
}

function findCommands(speach) {
	var found = false;
	for (var i = 0; i < speach.Morph.length; i++) {
		var word = speach.Morph[i].Lemmas[0];
		if (~word.Grammems[0].indexOf("V ") &&  ~word.Grammems[0].indexOf(" imper ")) {
			console.log(word.Text);
			var act = word.Text;
			found = true;
		};
		if (found && ~word.Grammems[0].indexOf("S ")) {
			console.log(word.Text);
			executeCommand(act, word.Text);
		}
	}
}

function executeCommand(action, subject) {
	exec('for /f usebackq %i in (`fsutil fsinfo drives`) do\
		 (for /f usebackq %i in (`dir d:\\' + subject + '.* /s/b`) do start %i)', 
		function(err) {console.log(err);});
	
}

function drawTable(speach) {
	var items = [];
	for (var i = 0; i < speach.Morph.length; i++) {
		var word = speach.Morph[i].Lemmas[0];
		items.push( "<tr><td>" + word.Text + "</td><td>" + word.Grammems[0] + "</td></tr>" );
	}
	$( "<table/>", {html: items.join( "" )}).appendTo( "body" );
}
