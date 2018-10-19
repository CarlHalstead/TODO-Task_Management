class Cookies{
	
	/**
	 * Set a cookies value to an empty value and set its expiry to as early as
	 * possible paying attention to that it uses UNIX (EPOCH?) time so cannot be 
	 * earlier than 1970.
	 * @param  {String} key [Name of cookie to delete]
	 */
	static deleteCookie(key){
		document.cookie = `${key}=; Path=/; expires=Thur, 01 Jan 1970 00:00:00 GMT`;
	}

	/**
	 * Check whether a cookie with a given key exists. It is classed as existing 
	 * as long as it is not empty according to Lodash.
	 * @param  {String} key [Name of the cookie]
	 * @return {Boolean}    [Whether the cookie is not empty]
	 */

	/**
	 * Save a cookie with a specified key and value, making sure that it is
	 * a site-wide cookie.
	 */
	static setCookie(key, value){
		document.cookie = `${key}=${value}; Path=/;`;
	}

	/**
	 * Search for a cookies value given its key. Using some string methods,
	 * split the cookie so we can extract its value and return it.
	 * @param  {String} key [Name of the cookie]
	 * @return {String}     [Value of the found cookie]
	 */
	static getCookie(key){
		if(_.isEmpty(document.cookie))
			return "";

		/*
			Cookies follow this pattern:
			cookieName=cookieValue; anotherCookieName=anotherCookieValue;	
		 */

		const cookies = document.cookie.split(';');

		for(let i = 0; i < cookies.length; i++){
			const cookie = cookies[i].split('=');
			const cookieKey = _.trim(cookie[0]);
			const cookieValue = cookie[1];

			if(cookieKey == key)
				return cookieValue;
		}

		return "";
	}

	static doesCookieExist(key){
		return !_.isEmpty(Cookies.getCookie(key));
	}
}