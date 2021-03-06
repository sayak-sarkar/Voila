// variable which will hold the database connection
var db;

//index.html

//Open the App Creation Section.
function createNew(){
	document.getElementById("appTypeSelector").className='hidden';
	document.getElementById("manifestGenerator").className='unhidden';
}

//Open the App List Section.
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
				var h4AppDescription = $("<h4/>").text(value.appdesc);
				var pDevName = $("<p/>").text("Developer: "+value.devname);
				var h5DevURL =  $("<h5/>").text(value.devurl);
				var dmanifest = $("<div/>").text(value.manifestdata);
				var deletebutton = "<input class='submit' onclick='deleteApp("+value.id+")' type='submit' value='Delete'>";
				var editbutton = "<input class='submit' onclick='editApp("+value.id+")' type='submit' value='Edit'>";
				//AppElement.append(value.id);
				AppElement.append(h3AppName);
				AppElement.append(h4AppDescription);
				AppElement.append(pDevName);
				AppElement.append(h5DevURL);
				//AppElement.append(dmanifest);
				$("#listContainer").append(AppElement);
				$("#listContainer").append(editbutton);
				$("#listContainer").append(deletebutton);
				$("#listContainer").append("<hr/>");

			    // move to the next item in the cursor
				cursor.continue();
		  	}
		};
}

//Functionilty to fetch an app from the IndexedDB and load it to the Development Form for modifications.
function editApp(appid) {
	document.getElementById("appList").className='hidden';

	var transaction = db.transaction([ 'Apps' ], 'readwrite');
	var store = transaction.objectStore('Apps');

	// open a cursor to retrieve all items from the 'Apps' store
	store.openCursor().onsuccess = function (e) {
		var cursor = e.target.result;
	 	if (cursor) {
	 		var value = cursor.value;

	 		if (value.id == appid) {
				document.getElementById("appname").value = value.appname;
				document.getElementById("appdesc").value = value.appdesc;
				document.getElementById("devname").value = value.devname;
				document.getElementById("devurl").value = value.devurl;

				document.getElementById("htmlInput").value = value.markupdata;
				document.getElementById("jsInput").value = value.scriptdata;
				document.getElementById("cssInput").value = value.styledata;

				window.editFlag=1;
				window.appid=appid;
	 		}
	 		else {
	 			cursor.continue();
	 		}
	 	}
	};

	document.getElementById("manifestGenerator").className='unhidden';
}

//Delete an app from the IndexedDB.
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

//Clear the IndexedDB to delete all apps.
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

//Function to open the Home section using the Back Button within the Manifest Generator section.
function goHomeFromManifest () {
	document.getElementById("manifestGenerator").className='hidden';
	document.getElementById("appTypeSelector").className='unhidden';
}

//Function to open the Home section using the Back Button within the App List section.
function goHomeFromAppList () {
	document.getElementById("appList").className='hidden';
	document.getElementById("appTypeSelector").className='unhidden';
}

//Function to open the Home section using the Back Button within the App Development section.
function goBackFromEditor () {
	document.getElementById("editor").className='hidden';
	document.getElementById("manifestGenerator").className='unhidden';
}

//Function to validate the user provided contents within the App Manifest section.
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


//Display the App Development section after the App Manifest Form has been filled up the user.
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

//Fetch Data from the User filled forms.
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

	//Reset the input forms.
	document.getElementById("appname").value="";
	document.getElementById("appdesc").value="";
	document.getElementById("devname").value="";
	document.getElementById("devurl").value="";
	document.getElementById("htmlInput").value="<!--Sample HTML Source below-->\n<html>\n<head>\n<meta charset='utf-8'>\n<title><!-- App Title --></title>\n<meta name='viewport' content='width=device-width, initial-scale=1'>\n\n<!--Do not change the css/js source-paths-->\n<link rel='stylesheet' href='style.css'>\n<script src='script.js'></script>\n</head>\n\n<body>\n<!-- App Content -->\n</body>\n</html>";
	document.getElementById("cssInput").value="/*\nTo use external CSS, make sure that you include the following line within your HTML:-\n\n<link rel='stylesheet' type='text/css' href='style.css'>\n*/";
	document.getElementById("jsInput").value="/*\nTo use external JS, make sure that you include the following line within your HTML:-\n\n<script src='script.js'></script>\n*/";

	//Reset to home screen.
	document.getElementById("editor").className="hidden";
	document.getElementById("appTypeSelector").className="unhidden";

	//remove previous iteration of the app.
	if (window.editFlag==1) {
		var transaction = db.transaction([ 'Apps' ], 'readwrite');
		var objStore = transaction.objectStore('Apps');
		
		var request = objStore.delete(window.appid);
		request.onsuccess = function () {
			//alert("App Updated!");
			viewExisting();
		}
		request.onerror = function (e) {
			alert("Error while updating the App : " + e.value);
		}
	}
}

//Package the app into a zip file.
function package() {
	var zip = new JSZip();
	zip.file("manifest.webapp", manifest);
	zip.file("index.html", markup);
	zip.file("style.css", style);
	zip.file("script.js", script);
	content = zip.generate();
	location.href="data:application/zip;base64," + content;
}

//Store the data within IndexedDB.
function store () {

	//IndexedDB Storage
	//console.log(db);
    
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
		alert("Your App has been saved!");
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
	  console.log('Files successfully written on the sdcard storage area.');
	  package();
	}

	request.onerror = function () {
	  console.warn('Unable to write the file: ' + this.error);
	}
}

//Function to invoke for installing the app within the device. [Requires install() API customizations to allow installation from "file://" paths.]
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

//Function to fetch data from SDCard storage.
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

//Function to delete files from the SDCard Storage.
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

//jQuery Function to be invoked during initialization to check for IndexedDB Support as well as retrieve or update existing IndexedDB stores.
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
