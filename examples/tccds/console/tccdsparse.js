/** 
 * TccdsParse
 * 
 * A module of utilities to parse TCCDS TSV files
 * 
 * @module TccdsParse
 * @author C. M. Boyd, ceilyn_boyd@harvard.edu
 * @copyright Harvard University Library
 * 
 * Module dependencies
 * string.js
 * underscore.js
 * 
 * Created: 16 April
 * Last update: 16 April 2016
 */

// Load the underscore module
var _ = require('underscore');
// Load the string module
var S = require('string');

/**
 * The TCCDS Parsing module definition
 */
var TccdsParse = (function() {
	/** 
	 * Private properties
	 */
	
	/**
	 * Version
	 * 
	 * @property _version
	 * @type {String}
	 */
	var _version = '1.0';
	
	/**
	 * Driver or Trend headers
	 * 
	 * Driver mentions and Trend mentions data are both structured the same way
	 * 
	 * @property _driver_trend_row_headers
	 * @type {Object}
	 */
	var _driver_trend_row_headers = {
			'Name':0,
			'Description':1,
			'Source':2,
			'Interview':3
	};
	
	/**
	 * Community engagement headers
	 * 
	 * @property _enagement_row_headers
	 * @type {Object}
	 */
	var _engagement_row_headers = {
			'Date':0,
			'Type':1,
			'Topics':2,
			'Summary':3,
			'Report':4
	};
	
	/**
	 * Valid source datasets and their associated row headers
	 * 
	 * @property _datasets
	 * @type {Object}
	 */
	var _datasets = [ 
		'Drivers',
		'Trends',
		'Engagement'
	];
	
	/**
	 * Private methods
	 */
	
	/**
	 * Parse and anonymize driver or trends mentions data by topic, returning an 
	 * array of objects.
	 * 
	 * Drivers and Trends data have the same format; Engagement data is structured differently.
	 * 
	 * @param {Array} TSV data read from file
	 * @param {Object} Metadata about this dataset
	 * @return {Object}
	 */
	anonymize_drivers_trends_by_topic = function(data, metadata) {
		// anonymized data
		var anonymized_data = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// object encapsulating data from this row
			var rowObj = {};
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if the row has some defined data, process it. otherwise, ignore it
			if (columns.length == 4) {
				var name_index = _driver_trend_row_headers['Name'];
				var desc_index = _driver_trend_row_headers['Description'];
				var interview_index = _driver_trend_row_headers['Interview'];
				var topic = columns[name_index];
				rowObj['name'] = columns[name_index];
				rowObj['description'] = columns[desc_index];
				// count the number of interviews for this particular driver/trend name
				var interviews_str = columns[interview_index];
				// split the interview string into individual interviews
				 var interviews = interviews_str.split(';');
				 // adjust the number of mentions if there were 'None' noted
				 var mentions = ((interviews.length == 1) && (interviews[0] == 'None')) ? 0 : interviews.length;
				 rowObj['mentions'] = mentions;
				// add the object to the set of anonymized data objects
				anonymized_data[topic] = rowObj;
			}
		});
		// return the anonymized data
		return {'metadata':metadata, 'data':anonymized_data};
	},
	
	/**
	 * Parse and anonymize driver or trends mentions data by number of mentions, returning an 
	 * array of objects.
	 * 
	 * Drivers and Trends data have the same format; Engagement data is structured differently.
	 * 
	 * @param {Array} TSV data read from file
	 * @param {Object} Metadata about this dataset
	 * @return {Object}
	 */
	anonymize_drivers_trends_by_mentions = function(data, metadata) {
		// anonymize by topics first
		var anonymized_data = anonymize_drivers_trends_by_topic(data, metadata);
		// grab just the data, we don't need the metadata
		anonymized_data = anonymized_data['data'];
		// transformed data
		var xformed_data = {};
		var topics = _.values(anonymized_data);
		topics.forEach(function(topic){
			var mentions = topic.mentions;
			// if this number of mentions is undefined, define it
			// and add an array that includes this object
			if (_.isUndefined(xformed_data[mentions])) {
				xformed_data[mentions] = [];
				xformed_data[mentions].push(topic);
			} else {
				// just add the item to the xformed data mentions
				xformed_data[mentions].push(topic);	
			}
		});
		// return the transformed data
		return {'metadata':metadata, 'data':xformed_data};
	},
	
	/**
	 * Parse and anonymize engagement topic mentions data by topic, returning an 
	 * array of objects. Note that engagement data is fairly complex, structurally,
	 * therefore we cannot use the same strategy as used for drivers and trends
	 * 
	 * @param {Array} TSV data read from file
	 * @param {Object} Metadata about the dataset
	 * @return {Object}
	 */
	anonymize_engagement_by_topic = function(data, metadata) {
		// topics that were mentioned during engagement sessions
		var engagement_topics = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if we have the right number of columns in the row, process it. otherwise, ignore it
			if (columns.length == 5) {
				var topics_index = _engagement_row_headers['Topics'];
				var topics_str = columns[topics_index];
				var topics = topics_str.split(';');
				topics.forEach(function(topic){
					// trim the topics
					topic = S(topic).trim().s;
					// if the topic does not yet exist, add it, and add a count
					if (_.isUndefined(engagement_topics[topic])) {
						engagement_topics[topic] = 1;
					} else {
						// if the topic has already been included, update its count
						engagement_topics[topic] = engagement_topics[topic] + 1;
					}
				});
			}
		});
		
		// return the engagement topics
		return {'metadata': metadata, 'data': engagement_topics};
	},
	
	/**
	 * Parse and anonymize engagement topic mentions data by number of mentions
	 * 
	 * @param {Array} TSV data read from file
	 * @param {Object} Metadata about the dataset
	 * @return {Object}
	 */
	anonymize_engagement_by_mentions = function(data, metadata) {
		// anonymize by topics first
		var anonymized_data = anonymize_engagement_by_topic(data, metadata);
		// grab just the data
		anonymized_data = anonymized_data['data'];
		// transformed data
		var xformed_data = {};
		var topics = _.keys(anonymized_data);
		topics.forEach(function(topic){
			var mentions = anonymized_data[topic];
			// if this number of mentions is undefined, define it
			// and add an array that includes this object
			if (_.isUndefined(xformed_data[mentions])) {
				xformed_data[mentions] = [];
				xformed_data[mentions].push(topic);
			} else {
				// just add the item to the xformed data mentions
				xformed_data[mentions].push(topic);			
			}
		});
		// return the transformed data
		return {'metadata': metadata, 'data':xformed_data};
	},
	
	/**
	 * Given some data, process it according to the specified row headers and by type
	 * 
	 * @param {String} Name of the source dataset
	 * @param {Array} TSV data read from file
	 * @param {Object} Metadata about this dataset
	 * @return {Object}
	 */
	process_data = function(category, dataset, data, metadata) {
		// validate parameters
		if ((_.isUndefined(category)) ||
			(_.isNull(category)) ||
			(_.isUndefined(data)) || 
			(_.isNull(data)) ||
			(_.isUndefined(dataset)) ||
			(_.isNull(dataset))  ||
			(_.isUndefined(metadata)) ||
			(_.isNull(metadata))) {
			return null;
		}
		
		// if the dataset is not valid, return
		if (_.indexOf(_datasets, dataset) == -1) {
			return null;
		}
		
		// based upon the dataset, select which row headers to use
		var anonymized_data = null;
		switch (dataset) {
		case 'Drivers':
			if (category == 'Topic') {
				anonymized_data = anonymize_drivers_trends_by_topic(data, metadata);
			} else {
				anonymized_data = anonymize_drivers_trends_by_mentions(data, metadata);
			}
			break;
		case 'Trends':
			if (category == 'Topic') {
				anonymized_data = anonymize_drivers_trends_by_topic(data, metadata);
			} else {
				anonymized_data = anonymize_drivers_trends_by_mentions(data, metadata);
			}
			break;
		case 'Engagement':
			if (category == 'Topic') {
				anonymized_data = anonymize_engagement_by_topic(data, metadata);
			} else {
				anonymized_data = anonymize_engagement_by_mentions(data, metadata);
			}
			break;
		default:
			break;
		}
		return anonymized_data;
	}
	
	/**
	 * Return the TccdsParse API
	 */
	return {
		/**
		 * Accessors
		 */
		
		/**
		 * Get the version number for this module
		 * 
		 * @return {String} Returns the string value of the version
		 */
		getVersion: function () {
			return _version;
		},
		
		/**
		 * Given a dataset in TSV format, process the number of mentions of a topic (e.g. driver, trend, engagement topic)
		 * that are mentioned, and return an object containing data about the dataset that
		 * is grouped by the topic
		 * 
		 * @param {String} Name of the dataset to process, either: Drivers, Trends, or Engagement
		 * @param {Array} Array of data to process
		 * @param {Object} Metadata associated with this data
		 * @return {Object}
		 */
		processDataByTopic: function(dataset, data, metadata) {
			// validate parameters
			if ((_.isUndefined(data)) || 
				(_.isNull(data)) ||
				(_.isString(data) == false) ||
				(_.isUndefined(dataset)) ||
				(_.isString(dataset) == false) ||
				(_.isNull(dataset)) ||
				(_.isUndefined(metadata)) ||
				(_.isNull(metadata))) {
				return false;
			}
			// process the data
			var anonymized_data = process_data('Topic', dataset, data, metadata);
			return anonymized_data;
		},
		
		/**
		 * Given a dataset in TSV format, process the number of mentions of a topic/item
		 * that are mentioned, and return an object containing data about the dataset that is 
		 * grouped by the number of mentions!
		 * 
		 * @param {String} Name of the dataset to process, either: Drivers, Trends, or Engagement
		 * @param {Array}
		 * @param {Object} Metadata associated with this data
		 * @return {Object}
		 */
		processDataByMentions: function(dataset, data, metadata) {
			// validate parameters
			if ((_.isUndefined(data)) || 
				(_.isNull(data)) ||
				(_.isString(data) == false) ||
				(_.isUndefined(dataset)) ||
				(_.isString(dataset) == false) ||
				(_.isNull(dataset)) ||
				(_.isUndefined(metadata)) ||
				(_.isNull(metadata))) {
				return false;
			}
			// process the data
			var anonymized_data = process_data('Mentions', dataset, data, metadata);
			return anonymized_data;
		},
		
	}
})();
		
/**
 * Export the TccdsParse API for NodeJS
 */
module.exports = TccdsParse;

