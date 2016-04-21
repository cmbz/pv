/**
 * Config API
 * 
 * This file contains the global configuration API for the Practical Data Visualization with JavaScript talk.
 * 
 * Use this simple file in lieu of a JavaScript framework.
 * 
 * @author C. M. Boyd, ceilyn_boyd@harvard.edu
 * @copyright Harvard University Library
 *  
 * @created 20 April 2016
 * @updated 20 April 2016
 */

/**
 * Return the Config API
 * 
 * Set the value of the _base_url to point to the root of your Website
 */
var Config = (function(){
	/**
	 * Base URL to use for all examples
	 * 
	 *  @property _base_url Base URL for all examples. Varies depending upon user's machine/installation
	 *  @type {String}
	 */
	var _base_url = 'http://localhost/pv'; // change this URL to match your Web server 
	
	return {
		/**
		 * Base URL for all examples
		 * 
		 * @param {Void}
		 * @return {String}
		 */
		getBaseUrl: function() {
			return _base_url;			
		},
		
		/**
		 * Base directory for all data
		 */
		getDataDirectory: function() {
			return _base_url + '/examples/data';
		}
	}
})();

