var exec = require('child_process').exec;
var fs = require('fs');
var paths;
try {paths = require('../../pc-voice-interface/pathcache.json');} catch(err) {paths = {};}
var templates = require('./templates.json');
var commands = require('./commands.json');
var operationId = 0;

function writeCache() {
	fs.writeFile('../../pc-voice-interface/pathcache.json', /* C:\Users\UserName\AppData\Local\ */
				JSON.stringify(paths, "", 4), 
				function (err) {if (err) console.log('Ошибка записи в pathcache.json: ', err);}
	);
}

function getUserChoise(name) {
	$checked = $('input[name="'+name+'"]:checked');
	if ($checked.filter(':checkbox').length) addPath(name, paths[name][$checked.filter(':radio').val()]);
	else executeFile(name, console.log.bind(console, '(getUserChoise)не могу открыть файл: '), $checked.filter(':radio').val());
}

function drawENOENT(filename) {
	answer(templates.enoent, {filename: filename, id:filename+operationId}) 
		.addClass('dragTarget')
		.on('dragenter', function() {$(this).addClass('hover'); return false;})
		.on('dragover', false)
		.on('dragleave', function() {$(this).removeClass('hover'); return false;})
		.on('drop', function(e) {
		var value = e.originalEvent.dataTransfer.files;
		value = (value.length > 1) ? value[0].path.slice(0, value.lastIndexOf('\\')) : value[0].path;
		$(this).removeClass('hover').find('span').html(value.slice(value.lastIndexOf('\\')+1)+' '); 
		addPath(filename, value, true);
		return false;
		});
}

function executeCommand(action, subject) {
	operationId++;
	if (commands.executeFile[action]) {
		if (subject.length<3) {answer('Слишком короткое имя файла!'); return;}
		if (!paths[subject]) findAndStart(subject);
		else executeFile(subject, findAndStart.bind(null, subject));
	} else answer('Пока не умею!');
}

function findAndStart(filename) {		// async!!
	var date = new Date();
	answer('Идет поиск...');
	exec('chcp 65001 | for /f "usebackq skip=1 delims=:" %i in \
		 (`"wmic logicaldisk where (drivetype="3") get Name"`) \
		 do @dir %i:\\*"' + filename + '"*.* /s /b | findstr /v /i /g:exeptions.txt', 
		function (error, stdout) {
			console.log(new Date() - date, ' мс');
			$('.container').children(':last').remove(); // удаляем строку "Идет поиск"
			//if (error) console.log('Ошибка поиска через cmd: ', error);
			if (!stdout) {drawENOENT(filename); return;}
			var path = stdout.toString().slice(0, -2).split('\r\n');
			try {addPath(filename, filter(path, filename));}
			catch(err) {console.log(err); findAndStart(filename);}
		}
    );
}

function filter(all, sample) {
	var result = [];
	for (var i = 0; i < all.length; i++) {
		var start = all[i].toLowerCase().lastIndexOf(sample.toLowerCase());
		if (!~start) throw new Error('Bad encoding: ' + all[i]);
		var end = start + sample.length;
		if ((all[i].charAt(start-1) == '\\') && (all[i].charAt(end) == '.') || (end == all[i].length)) {
			result.push(all[i]);
		}
	}
	return result[0] ? result : all;
}

function addPath(filename, path) {
	paths[filename] = path.split ? path.split('\r\n') : path;
	executeFile(filename, function(err) {
										console.log('не могу открыть файл: ', err); 
										answer(templates.execErr, {filename: filename});
										}
	);
}

function executeFile(filename, errCallback, index) {
	if ((index !== undefined) || (paths[filename].length == 1)) {
		exec('start explorer.exe "' + paths[filename][index || 0] + '"', 
			function (err) {if (err) errCallback(err);});
	} else {
		var ammount = paths[filename].length;
		answer(templates.multipleTop, {ammount: ammount}, '<ol/>');
		for (var i=0; i<ammount; i++) {answer(templates.multiple, new FileParams(filename, i));}
		answer(templates.multipleBottom, {filename: filename});
	}
}

function FileParams(filename, i) {
	var path = paths[filename][i];
	this.id = filename+operationId+i;
	this.filename = filename;
	this.index = i;
	this.fullname = path.slice(path.lastIndexOf('\\')+1);
	this.path = path.slice(0, path.lastIndexOf('\\')+1);
	this.shortpath = (this.path.length > 34) ? this.path.slice(0, 33) + '…' : this.path;
}

function answer(template, variables, parent) {
	var str = template;
	if (variables) for (var key in variables) {
        str = str.split('<%' + key + '%>').join(variables[key]);
    }
	$lastInst = $('.container').children(':last');
	if ($lastInst.hasClass('app_voice')) {$lastInst.append(str)}
	else {
		$lastInst = $(parent || '<div/>', {html: str}).addClass('app_voice').appendTo('.container');
		notify();
	}
	return $lastInst;
}