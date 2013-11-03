// variable which will hold the database connection
var db;

//index.html
function createNew(){
	document.getElementById("appTypeSelector").className='hidden';
	document.getElementById("manifestGenerator").className='unhidden';
}

function viewExisting() {
	document.getElementById("appTypeSelector").className='hidden';
	document.getElementById("appList").className='unhidden';

	//Empty the list first
		$("#listContainer").html("");
	  	//Read the Apps
     	var transaction = db.transaction([ 'Apps' ]);
	  	var store = transaction.objectStore('Apps');
	
  	  	// open a cursor to retrieve all items from the 'Apps' store
	  	store.openCursor().onsuccess = function (e) {
			var cursor = e.target.result;
		 	if (cursor) {
			    var value = cursor.value;
		 		var AppElement = $("<div/>");
				var h3AppName = $("<h3/>").text(value.appname);
				var pAppDescription = $("<p/>").text(value.appdesc);
				var pDevName = $("<p/>").text(value.devname);
				var pDevURL =  $("<p/>").text(value.devurl);
				var dmanifest = $("<div/>").text(value.manifestdata);
				var deletebutton = "<input class='submit' onclick='deleteApp("+value.id+")' type='submit' value='Delete'>";
				var editbutton = "<input class='submit' onclick='editApp()' type='submit' value='Edit'>";
				AppElement.append(value.id);
				AppElement.append(h3AppName);
				AppElement.append(pAppDescription);
				AppElement.append(pDevName);
				AppElement.append(pDevURL);
				AppElement.append(dmanifest);
				$("#listContainer").append(AppElement);
				$("#listContainer").append(editbutton);
				$("#listContainer").append(deletebutton);
				$("#listContainer").append("<hr/>");

				function editApp () {
					document.getElementById("appList").className='hidden';
					
					document.getElementById("manifestGenerator").className='unhidden';
				}

			    // move to the next item in the cursor
				cursor.continue();
		  	}
		};
}

function deleteApp (appid) {
	var transaction = db.transaction([ 'Apps' ], 'readwrite');
	var store = transaction.objectStore('Apps');
	
	var request = store.delete(appid);
	request.onsuccess = function () {
		alert("App deleted!");
		viewExisting();
	}
	request.onerror = function (e) {
		alert("Error while deleting App : " + e.value);
	};
}

function deleteAll() {
	var transaction = db.transaction([ 'Apps' ], 'readwrite');
	var store = transaction.objectStore('Apps');
	   
	//Delete all the Apps
	//Alternately if you know the ID, you can use store.delete(ID) for individual item deletion
	var request = store.clear();
	request.onsuccess = function () {
		$("#listContainer").html("");
		alert("All Apps have been deleted!");
	}
	request.onerror = function (e) {
		alert("Error while deleting Apps : " + e.value);
	};
}

function goHomeFromManifest () {
	document.getElementById("manifestGenerator").className='hidden';
	document.getElementById("appTypeSelector").className='unhidden';
}

function goHomeFromAppList () {
	document.getElementById("appList").className='hidden';
	document.getElementById("appTypeSelector").className='unhidden';
}

function goBackFromEditor () {
	document.getElementById("editor").className='hidden';
	document.getElementById("manifestGenerator").className='unhidden';
}

function validateForm() {

	window.manifest = '{';
	window.appname = document.forms['manifestForm'].elements[0].value;
	window.appdesc = document.forms['manifestForm'].elements[1].value;
	window.devname = document.forms['manifestForm'].elements[2].value;
	window.devurl = document.forms['manifestForm'].elements[3].value;

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

	//IndexedDB Storage
	console.log(db);
	//Initialize the Database first
    //initializeDB();

    console.log(db);

	// create the transaction with 1st parameter is the list of stores and the second specifies
	// a flag for the readwrite option
	var transaction = db.transaction([ 'Apps' ], 'readwrite');
	
	//Create the Object to be saved i.e. our App
	var value = {};
	value.appname = window.appname;
	value.appdesc = window.appdesc;
	value.devname = window.devname;
	value.devurl = window.devurl;

	value.manifestdata = window.manifest;
	
	value.markupdata = window.markup;
	value.scriptdata = window.script;
	value.styledata = window.style;

	// add the App to the store
	var store = transaction.objectStore('Apps');
	var request = store.add(value);
	request.onsuccess = function (e) {
		alert("Your App has been saved");
	};
	request.onerror = function (e) {
	   	alert("Error in saving the App. Reason : " + e.value);
	}

	//SD card Storage
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
	  package();
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

$(document).ready(function(){

	if (window.indexedDB) {
		console.log("IndexedDB support is there");
	}
	else {
		alert("Indexed DB is not supported. Where are you trying to run this ? ");
	}
 
	// open the database
	// 1st parameter : Database name. We are using the name 'Appsdb'
	// 2nd parameter is the version of the database.
	var request = indexedDB.open('Appsdb', 1);
	
	request.onsuccess = function (e) {
		// e.target.result has the connection to the database
	  	db = e.target.result;

	  	//console.log(db);
	  	console.log("DB Opened!");
	  	//Alternately, if you want - you can retrieve all the items
	}
	 
	request.onerror = function (e) {
	   	console.log(e);
	};
	 
	// this will fire when the version of the database changes
	// We can only create Object stores in a versionchange transaction.
	request.onupgradeneeded = function (e) {
	   	// e.target.result holds the connection to database
	   	db = e.target.result;
	   
	   	if (db.objectStoreNames.contains("Apps")) {
	    	db.deleteObjectStore("Apps");
	   	}
		
	   	// create a store named 'Apps'
	   	// 1st parameter is the store name
	   	// 2nd parameter is the key field that we can specify here. Here we have opted for autoIncrement but it could be your
	   	// own provided value also.
	   	var objectStore = db.createObjectStore('Apps', { keyPath: 'id', autoIncrement: true });
	   
	   	console.log("Object Store has been created");
	};

});