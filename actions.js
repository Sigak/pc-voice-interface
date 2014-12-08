var exec = require('child_process').exec;
var fs = require('fs');
try {var paths = require('../../pc-voice-interface/pathcache.json');} catch(err) {var paths = {};}

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
	if (!paths[subject]) findAndStart(subject);
	else exec(paths[subject], function (err, out) {if (err) findAndStart(subject);});
}

function findAndStart(filename) {		// async!!
	exec('chcp 65001 | for /f "usebackq skip=1 delims=:" %i in \
		 (`"wmic logicaldisk where (drivetype="3") get Caption"`) \
		 do @dir %i:\\' + filename + '.* /s /b', 
		function (error, stdout, stderr) {
			if (error) console.log('error: ', error);
			if (!stdout) return;	// файл не найден
			paths[filename] = stdout.toString().slice(0, -2);
			exec(paths[filename], function (err) {if (err) console.log('error: ', err);});
			fs.writeFile('../../pc-voice-interface/pathcache.json', // C:\Users\UserName\AppData\Local\
						JSON.stringify(paths, "", 4), 
						function (err) {if (err) console.log('error: ', err);}
			);
		}
    );
}

function drawTable(speach) {
	var items = [];
	for (var i = 0; i < speach.Morph.length; i++) {
		var word = speach.Morph[i].Lemmas[0];
		items.push( "<tr><td>" + word.Text + "</td><td>" + word.Grammems[0] + "</td></tr>" );
	}
	$( "<table/>", {html: items.join( "" )}).appendTo( "body" );
}