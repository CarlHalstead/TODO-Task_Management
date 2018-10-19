class Utilities{
	static redirect(url){
    	location.href = url;
	}

	static removeAllChildren(domId){
		const domElement = document.getElementById(domId);

		while(domElement.firstChild != null)
			domElement.removeChild(domElement.firstChild);
	}
}

