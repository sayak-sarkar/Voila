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

	if (editorId=='htmlInput') {
		document.getElementById('htmlLabel').style.background='-moz-linear-gradient(center top , #84c63c 0pt, #57a21f 100%)';
		document.getElementById('cssLabel').style.background='#c13832';
		document.getElementById('jsLabel').style.background='#c13832';
	} 
	else if (editorId=='cssInput') {
		document.getElementById('cssLabel').style.background='-moz-linear-gradient(center top , #84c63c 0pt, #57a21f 100%)';
		document.getElementById('htmlLabel').style.background='#c13832';
		document.getElementById('jsLabel').style.background='#c13832';
	} 
	else if (editorId=='jsInput') {
		document.getElementById('jsLabel').style.background='-moz-linear-gradient(center top , #84c63c 0pt, #57a21f 100%)';
		document.getElementById('htmlLabel').style.background='#c13832';
		document.getElementById('cssLabel').style.background='#c13832';
	} 

}

function submitCode () {
	window.style = document.forms['editorForm'].elements[1].value;
	window.markup = document.forms['editorForm'].elements[0].value;
	window.script = document.forms['editorForm'].elements[2].value;
	
	/*Comment out or Uncomment any of the following function calls to either store or fetch data to/from the sdcard,
	 or install to the device or optionally return the application package as a zipped file to the user*/
	store();
	//fetch();
	//install();
	//package();
}

function package() {
    var zip = new JSZip();
    zip.file("manifest.webapp", manifest);
    zip.file("index.html", markup);
    zip.file("style.css", style);
    zip.file("script.js", script);
    content = zip.generate();
    location.href="data:application/zip;base64," + content;
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
	  console.log('Files successfully written on the sdcard storage area');
	}

	request.onerror = function () {
	  console.warn('Unable to write the file: ' + this.error);
	}
}

function install () {
	var manifestUrl = "voila/app/manifest.webapp";
	var request = window.navigator.mozApps.installPackage(manifestUrl);
	request.onsuccess = function () {
	  // Save the App object that is returned
	  var appRecord = this.result;
	  alert('Installation successful!');
	};
	request.onerror = function () {
	  // Display the error information from the DOMError object
	  alert('Install failed, error: ' + this.error.name);
	};
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
	  console.log("File path: " + file.mozFullPath)

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