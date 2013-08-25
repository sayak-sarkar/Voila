//index.html
function validateForm()
{
	window.manifest = '{';
	window.appname = document.forms['manifestForm'].elements[0].value;

	for (i=0;i<4;i++) {
		var box = document.forms['manifestForm'].elements[i];
		if (!box.value && i<2) {
			alert('You haven\'t filled in ' + box.name + '!');
			box.focus()
			return;
		}
		if (i==2) {
			manifest += '\n  "launch_path": "/index.html", \n  "developer" : {';	
		}
		if (i<2) {
			manifest += '\n' + '  "' + box.name + '"' + ': ' + '"' + box.value + '",';
		}
		else if (i<3) {
			manifest += '\n' + '    "' + box.name + '"' + ': ' + '"' + box.value + '",';
		}
		if (i==3) {
			manifest += '\n' + '    "' + box.name + '"' + ': ' + '"' + box.value + '"' + '\n  }' + '\n}';
		}
	}
	
	document.getElementById('manifestGenerator').className='hidden';
	document.getElementById('editor').className='unhidden';
}

//editor.html
function unhide(editorId) {			
	var item = document.getElementById(editorId);
	
	document.getElementById('cssInput').className='hidden';
	document.getElementById('htmlInput').className='hidden';
	document.getElementById('jsInput').className='hidden';

	if (item) {
		item.className='unhidden';
	}
}

function submitCode () {
	window.style = document.forms['editorForm'].elements[1].value;
	window.markup = document.forms['editorForm'].elements[0].value;
	window.script = document.forms['editorForm'].elements[2].value;
	//store();
	fetch();
}

function store () {
	var sdcard = navigator.getDeviceStorage("sdcard");

	var manifestdata = new Blob([window.manifest], {type: "text/plain"});
	var markupdata = new Blob([window.markup], {type: "text/plain"});
	var styledata = new Blob([window.style], {type: "text/plain"});
	var scriptdata = new Blob([window.script], {type: "text/plain"});

	var request = sdcard.addNamed(manifestdata, "voila/"+appname+"/manifest.webapp");
	var request = sdcard.addNamed(markupdata, "voila/"+appname+"/index.html");
	var request = sdcard.addNamed(styledata, "voila/"+appname+"/style.css");
	var request = sdcard.addNamed(scriptdata, "voila/"+appname+"/script.js");


	request.onsuccess = function () {
	  var name = this.result;
	  console.log('File "' + name + '" successfully wrote on the sdcard storage area');
	}

	request.onerror = function () {
	  console.warn('Unable to write the file: ' + this.error);
	}
}

function fetch () {
	var sdcard = navigator.getDeviceStorage('sdcard');

	var cursor = sdcard.enumerate();

	cursor.onsuccess = function () {
	  var file = this.result;
	  
	  var reader = new FileReader();
	  
	  reader.readAsBinaryString(file);

	  reader.onloadend = function () {
	  	fileBinaryString = reader.result;
	  	alert(fileBinaryString);
	  }

	  console.log("File name: " + file.name);
	  console.log("File type: " + file.type);

	  if (!this.done) {
	  	this.continue();
	  }
	}

	cursor.onerror = function () {
	  console.warn("No file found: " + this.error);
	}
}

function remove () {
	var sdcard = navigator.getDeviceStorage('sdcard');

	var request = sdcard.delete("filename");

	request.onsuccess = function () {
	  console.log("Files deleted");
	}

	request.onerror = function () {
	  console.log("Unable to delete the file: " + this.error);
	}
}