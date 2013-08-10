//index.html
function validateForm()
{
	var manifest = '{';

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
	console.log(manifest);
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
	var style = document.forms['editorForm'].elements[1].value;
	var markup = document.forms['editorForm'].elements[0].value;
	var script = document.forms['editorForm'].elements[2].value;

	console.log(markup);
	console.log(style);
	console.log(script);
}