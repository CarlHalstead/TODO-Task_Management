function redirect(url){
    location.href = url;
}

function removeAllChildren(domElement){
	while(domElement.firstChild != null)
		domElement.removeChild(domElement.firstChild);
}