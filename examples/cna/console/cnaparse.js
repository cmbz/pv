/** 
 * CNAParse
 * 
 * A module of utilities to parse Colonial North American TSV files
 * 
 * @module CNAParse
 * @author C. M. Boyd, ceilyn_boyd@harvard.edu
 * @copyright Harvard University Library
 * 
 * Module dependencies
 * string.js
 * underscore.js
 * 
 * Created: 18 April
 * Last update: 19 April 2016
 */

// Load the underscore module
var _ = require('underscore');
// Load the string module
var S = require('string');
// Load the XRegExp module
var XRegExp = require('xregexp');
// Load the moment module
var moment = require('moment');

/**
 * The CNA Parsing module definition
 */
var CNAParse = (function() {
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
	 * Earliest date expected
	 * 
	 * @property _earliest_date
	 * @type {String}
	 */
	var _earliest_date = '1500';
	
	/**
	 * Latest date expected
	 * 
	 * @property _latest_date
	 * @type {String}
	 */
	var _latest_date = '1900';
	
	/**
	 * Headers in the CNA datafile and their associated column index
	 *
	 * @property _driver_trend_row_headers
	 * @type {Object}
	 */
	var _all_headers = {
			'Inventory_2016_03_ID':0,
			'Title':1,
			'Author':2,
			'Label':3,
			'HOLLIS':4,
			'EAD':5,
			'Owner':6,
			'Sequences':7,
			'Insertion Date':8,
			'Insertion Month':9,
			'URN':10,
			'URL':11,
			'HOLLIS_date1':12,
			'HOLLIS_date2':13,
			'DB_pageCount':14,
			'HOLLIS_languageCode':15,
			'Description':16,
			'Subject_category1':17,
			'Subject_category2':18,
			'Subject_category3':19,
			'Subject_category4':20,
			'Region_category1':21,
			'Region_category2':22,
			'Region_category3':23,
			'Region_category4':24,
			'DB_subjectArea':25,
			'Material_format1':26,
			'Material_format2':27,
			'Material_format3':28,
			'Notable_content':29,
			'Online_findingAid':30,
			'Collection_size':31,
			'Normalized Collection':32,
			'Size':33,
			'Volumes':34,
			'Documents':35,
			'Est_Num_Folders':36,
			'Est_Num_Objects':37
	};
	
	/**
	 * Lookup table for MARC language codes
	 * 
	 * @property _marc_language_lookup
	 * @type {Object}
	 */
	var _marc_language_lookup = {
		'eng':'English',
		'fre':'French',
		'mul':'Multiple',
		'gre':'Greek',
		'ger':'German',
		'heb':'Hebrew',
		'lat':'Latin',
		'':'Unspecified',
		'spa':'Spanish',
		'del':'Delaware'
	};
	
	/**
	 * Valid geocodes for regions
	 * 
	 * Service used: https://developers.google.com/maps/documentation/geocoding/intro#Geocoding
	 * 
	 * @property _geocode_regions
	 * @type {Object}
	 */
	var _geocode_regions = {
			'Canada':[56.130366,-106.346771],
			'Europe':[54.525961,15.255119],
			'France':[46.227638,2.213749],
			'Great Britain':[55.378051,	-3.435973],
			'Mexico':[23.634501,-102.552784],
			'Mid-Atlantic':[40.216408,-73.276536],
			'Midwest':[43.41136,-106.280024],
			'New England':[43.965389,-70.822654],
			'North America':[54.525961,-105.255119],
			'Spain':[40.463667,-3.74922],
			'The Caribbean':[21.469114,-78.656894],
			'The South':[] // no valid coordinates
	};
	
	/**
	 * Valid source datasets
	 * 
	 * @property _datasets
	 * @type {Object}
	 */
	var _datasets = [ 
		'LanguageFrequency',
		'SubjectFrequency',
		'NarrowSubjectFrequency',
		'RegionFrequency',
		'LabelDate',
		'LabelDateFrequency',
		'GeocodeRegions'
	];
	
	/**
	 * Private methods
	 */
	
	
	/**
	 * Generate a dataset of geocoded data based upon the first region assignment (if any)
	 * 
	 * @param {Array} TSV data read from file
	 * @return {Object} Data and metadata for the dataset
	 */
	process_geocode_regions = function(data, metadata) {
		// set of items by region
		var region_items = {};
		// region frequency
		var region_frequency = {};
		// set of regions represented
		var regions = [];
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if there aren't enough columns, ignore the row
			if (columns.length == 37) {
				// get the first region, if any
				var region1 = columns[_all_headers['Region_category1']];
				// ignore all points coded primary with 'The South'
				if ((region1 != 'The South') && (region1 != '')) {
					// update frequency
					if (_.isUndefined(region_frequency[region1])) {
						region_frequency[region1] = 1;
					} else {
						region_frequency[region1] = region_frequency[region1] + 1;
					}
					// add the region
					regions.push(region1);
					// get its geocoding
					var coords = _geocode_regions[region1];
					// get the label 
					var label = columns[_all_headers['Label']];
					// create the entry
					region_items[label] = coords;				
				}
			}
		});
		
		// update the metadata
		metadata['num_items'] = _.keys(region_items).length;
		metadata['regions'] = _.uniq(regions);
		metadata['num_regions'] = metadata['regions'].length;
		metadata['region_frequency'] = region_frequency;
		metadata['region_geocodes'] = _geocode_regions;
		
		// return the dataset and its metadata
		return {'metadata': metadata, 'data': region_items};
	},
	
	
	/**
	 * Given an interval, get the best date out of an array of dates
	 * 
	 * @param {String} Start date
	 * @param {String} End date
	 * 
	 */
	get_best_date = function(start, end, dates) {
		// if no dates were found, return start date
		if ((_.isEmpty(dates)) || (_.isUndefined(dates))) {
			return start;
		}
		
		// define start/end moments
		var sm = moment(start);
		var em = moment(end);
		
		// if there is one date in the array, and it is in the interval, return
		if (dates.length == 1) {
			if (moment(dates[0]).isBetween(start, end)) {
				return dates[0];
			} else {
				return start;
			}
		}
		// if there are more than one date in the array, reverse the array and walk it
		// until you find a date within the interval
		var best = [];
		if (dates.length > 1) {
			dates.reverse();
			dates.forEach(function(date){
				if (moment(date).isBetween(start, end)) {
					best.push(date);
				}
			});
		}
		// if nothing was in the interval, return the end date
		if (_.isEmpty(best)) {
			return end;
		}
		return best[0];
	}
	
	/**
	 * Generate a dataset of frequency of date extracted from a METS label 
	 * 
	 * @param {Array} TSV data read from file
	 * @return {Object} Data and metadata for the dataset
	 */
	process_label_date_frequency = function(data, metadata) {
		// set of dates, by frequency
		var date_frequency = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if there aren't enough columns, ignore the row
			if (columns.length == 37) {
				// get the start date (if any)
				var start = columns[_all_headers['HOLLIS_date1']];
				// make sure the date is valid and within range
				start = ((start != '') && (moment(start).isValid()) && (moment(start).isAfter(_earliest_date))) ? start : _earliest_date;
				// get the end date (if any)
				var end = columns[_all_headers['HOLLIS_date2']];
				// make sure the date is valid and within range
				end = ((end != '') && (moment(end).isValid()) && (moment(end).isBefore(_latest_date))) ? end : _latest_date;			
				// get the label 
				var label = columns[_all_headers['Label']];
				// look for all dates in the label
				var dates = XRegExp.match(label, /[0-9]{4}/, 'all');
				// set the label date to the best date possible
				var label_date = get_best_date(start, end, dates);
				// if the label date does not yet exist, create it
				if (_.isUndefined(date_frequency[label_date])) {
					date_frequency[label_date] = 1;
				} else {
					// update the count for the date if it already exists
					date_frequency[label_date] = date_frequency[label_date] + 1;
				}
			}
		});
		
		// update the metadata
		metadata['num_dates'] = _.keys(date_frequency).length;
		
		// return the dataset and its metadata
		return {'metadata': metadata, 'data': date_frequency};
	},
	
	
	/**
	 * Generate a dataset by extracting date information out of a label
	 * 
	 * @param {Array} TSV data read from file
	 * @return {Object} Data and metadata for the dataset
	 */
	process_label_date = function(data, metadata) {
		// set of return objects + dates
		var objects_by_date = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if there aren't enough columns, ignore the row
			if (columns.length == 37) {
				// get the start date (if any)
				var start = columns[_all_headers['HOLLIS_date1']];
				// make sure the date is valid and within range
				start = ((start != '') && (moment(start).isValid()) && (moment(start).isAfter(_earliest_date))) ? start : _earliest_date;
				// get the end date (if any)
				var end = columns[_all_headers['HOLLIS_date2']];
				// make sure the date is valid and within range
				end = ((end != '') && (moment(end).isValid()) && (moment(end).isBefore(_latest_date))) ? end : _latest_date;				
				// get the label 
				var label = columns[_all_headers['Label']];
				// look for dates in the label
				var dates = XRegExp.match(label, /[0-9]{4}/, 'all');
				// label date
				var label_date = get_best_date(start, end, dates);
				// add the date and the object
				objects_by_date[label] = {
						'date': label_date,
						'url': columns[_all_headers['URL']], 
						'ead': columns[_all_headers['EAD']], 
						'owner': columns[_all_headers['Owner']]};
			}
		});
		
		// update the metadata
		metadata['num_digital_objects'] = _.keys(objects_by_date).length;
		
		// return the dataset and its metadata
		return {'metadata': metadata, 'data': objects_by_date};
	},
	
	/**
	 * Generate a (survey) region frequency dataset
	 * 
	 * @param {Array} TSV data read from file
	 * @return {Object} Data and metadata for the dataset
	 */
	process_region_frequency = function(data, metadata) {
		// set of regions
		var regions = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if there aren't enough columns, ignore the row
			if (columns.length == 37) {
				// get the regions
				var r1 = columns[_all_headers['Region_category1']];
				var r2 = columns[_all_headers['Region_category2']];
				var r3 = columns[_all_headers['Region_category3']];
				var r4 = columns[_all_headers['Region_category4']];
				// address region 1
				if (_.isUndefined(regions[r1]) && r1 != '') {
					regions[r1] = {};
					regions[r1].mentions = 1;
					regions[r1].objects = [];
					regions[r1].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']],
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank subjects
					if (r1 != '') { 
						regions[r1].mentions = regions[r1].mentions + 1;
						regions[r1].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
				
				// address region 2
				if (_.isUndefined(regions[r2]) && r2 != '') {
					regions[r2] = {};
					regions[r2].mentions = 1;
					regions[r2].objects = [];
					regions[r2].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank regions
					if (r2 != '') { 
					regions[r2].mentions = regions[r2].mentions + 1;
					regions[r2].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
				
				// address region 3
				if (_.isUndefined(regions[r3]) && r3 != '') {
					regions[r3] = {};
					regions[r3].mentions = 1;
					regions[r3].objects = [];
					regions[r3].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank regions
					if (r3 != '') { 
					regions[r3].mentions = regions[r3].mentions + 1;
					regions[r3].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
				
				// address region 4
				if (_.isUndefined(regions[r4]) && r4 != '') {
					regions[r4] = {};
					regions[r4].mentions = 1;
					regions[r4].objects = [];
					regions[r4].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank regions
					if (r4 != '') { 
					regions[r4].mentions = regions[r4].mentions + 1;
					regions[r4].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
			}
		});
		
		// update the metadata
		metadata['num_regions'] = _.keys(regions).length;
		metadata['regions'] = _.keys(regions);
		
		// return the dataset and its metadata
		return {'metadata': metadata, 'data': regions};
	},
	
	/**
	 * Generate a (survey) subject frequency dataset
	 * 
	 * @param {Array} TSV data read from file
	 * @return {Object} Data and metadata for the dataset
	 */
	process_subject_frequency = function(data, metadata) {
		// set of subjects
		var subjects = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if there aren't enough columns, ignore the row
			if (columns.length == 37) {
				// get the regions
				var s1 = columns[_all_headers['Subject_category1']];
				var s2 = columns[_all_headers['Subject_category2']];
				var s3 = columns[_all_headers['Subject_category3']];
				var s4 = columns[_all_headers['Subject_category4']];
				// address subject 1
				if (_.isUndefined(subjects[s1]) && s1 != '') {
					subjects[s1] = {};
					subjects[s1].mentions = 1;
					subjects[s1].objects = [];
					subjects[s1].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']],
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank subjects
					if (s1 != '') { 
						subjects[s1].mentions = subjects[s1].mentions + 1;
						subjects[s1].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
				
				// address subject 2
				if (_.isUndefined(subjects[s2]) && s2 != '') {
					subjects[s2] = {};
					subjects[s2].mentions = 1;
					subjects[s2].objects = [];
					subjects[s2].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank subjects
					if (s2 != '') { 
					subjects[s2].mentions = subjects[s2].mentions + 1;
					subjects[s2].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
				
				// address subject 3
				if (_.isUndefined(subjects[s3]) && s3 != '') {
					subjects[s3] = {};
					subjects[s3].mentions = 1;
					subjects[s3].objects = [];
					subjects[s3].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank subjects
					if (s3 != '') { 
					subjects[s3].mentions = subjects[s3].mentions + 1;
					subjects[s3].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
				
				// address subject 4
				if (_.isUndefined(subjects[s4]) && s4 != '') {
					subjects[s4] = {};
					subjects[s4].mentions = 1;
					subjects[s4].objects = [];
					subjects[s4].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});
				} else {
					// disallow blank subjects
					if (s4 != '') { 
					subjects[s4].mentions = subjects[s4].mentions + 1;
					subjects[s4].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
			}
		});
		
		// update the metadata
		metadata['num_subjects'] = _.keys(subjects).length;
		metadata['subjects'] = _.keys(subjects);
		
		// return the dataset and its metadata
		return {'metadata': metadata, 'data': subjects};
	},
	
	/**
	 * Generate a special, narrow (survey) subject frequency dataset
	 * 
	 * @param {Array} TSV data read from file
	 * @return {Object} Data and metadata for the dataset
	 */
	process_narrow_subject_frequency = function(data, metadata) {
		// set of subjects
		var subjects = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if there aren't enough columns, ignore the row
			if (columns.length == 37) {
				// get the special subject areas
				var db1 = columns[_all_headers['DB_subjectArea']];

			// address special db subject area
			if (_.isUndefined(subjects[db1]) && db1 != '') {
				subjects[db1] = {};
				subjects[db1].mentions = 1;
				subjects[db1].objects = [];
				subjects[db1].objects.push({'name': columns[_all_headers['Label']], 
					  'url': columns[_all_headers['URL']], 
					  'ead': columns[_all_headers['EAD']], 
					  'owner': columns[_all_headers['Owner']]});
			} else {
				// disallow blank subjects
				if (db1 != '') { 
					subjects[db1].mentions = subjects[db1].mentions + 1;
					subjects[db1].objects.push({'name': columns[_all_headers['Label']], 
						  'url': columns[_all_headers['URL']], 
						  'ead': columns[_all_headers['EAD']], 
						  'owner': columns[_all_headers['Owner']]});	
					}
				}
			}
		});
		
		// update the metadata
		metadata['num_subjects'] = _.keys(subjects).length;
		metadata['subjects'] = _.keys(subjects);
		
		// return the dataset and its metadata
		return {'metadata': metadata, 'data': subjects};
	},
	
	/**
	 * Generate a language frequency dataset
	 * 
	 * @param {Array} TSV data read from file
	 * @return {Object} Data and metadata for the dataset
	 */
	process_language_frequency = function(data, metadata) {
		// set of languages
		var languages = {};
		// split the data into rows
		rows = data.split('\n');
		// remove the header row
		rows.shift();
		// process each row
		rows.forEach(function(row){
			// break string into columns
			var columns = S(row).parseCSV('\t','"');
			// if there aren't enough columns, ignore the row
			if (columns.length == 37) {
				var lang = _all_headers['HOLLIS_languageCode'];
				var language = columns[_all_headers['HOLLIS_languageCode']];
				if (_.isUndefined(languages[language])) {
					languages[language] = {};
					languages[language].mentions = 1;
					languages[language].objects = [];
					languages[language].objects.push({'name': columns[_all_headers['Label']], 
													  'url': columns[_all_headers['URL']], 
													  'ead': columns[_all_headers['EAD']], 
													  'owner': columns[_all_headers['Owner']]});
				} else {
					languages[language].mentions = languages[language].mentions + 1;
					languages[language].objects.push({'name': columns[_all_headers['Label']], 
						  							'url': columns[_all_headers['URL']], 
													 'ead': columns[_all_headers['EAD']], 
													 'owner': columns[_all_headers['Owner']]});
				}
			}
		});
		
		// update the metadata
		var marc_lang = _.keys(languages);
		metadata['pretty_languages'] = [];
		// rewrite language codes if possible
		marc_lang.forEach(function(ml){
			if (_.isUndefined(_marc_language_lookup[ml]) == false) {
				metadata['pretty_languages'].push(_marc_language_lookup[ml]);
			} else {
				metadata['pretty_languages'].push(ml);
			}
		});
		metadata['num_languages'] = _.keys(languages).length;
		metadata['marc_language_lookup'] = _marc_language_lookup;
		
		// return the dataset and its metadata
		return {'metadata': metadata, 'data': languages};
	},

	/**
	 * Given some data, process it according to the specified dataset name
	 * 
	 * @param {String} Name of the source dataset
	 * @param {Array} TSV data read from file
	 * @param {Object} Metadata about this dataset
	 * @return {Object}
	 */
	process_data = function(dataset, data, metadata) {
		// validate parameters
		if ((_.isUndefined(dataset)) ||
			(_.isNull(dataset)) ||
			(_.isUndefined(data)) || 
			(_.isNull(data)) ||
			(_.isUndefined(metadata)) ||
			(_.isNull(metadata))) {
			return null;
		}
		
		// if the dataset is not valid, return
		if (_.indexOf(_datasets, dataset) == -1) {
			return null;
		}
		
		// based upon the dataset, select the name of the function to call
		var all_data = null;
		switch (dataset) {
			case 'LanguageFrequency':
				 all_data = process_language_frequency(data, metadata);
				break;
			case 'SubjectFrequency':
				all_data = process_subject_frequency(data, metadata);
				break;
			case 'NarrowSubjectFrequency':
				all_data = process_narrow_subject_frequency(data, metadata);
				break;
			case 'RegionFrequency':
				all_data = process_region_frequency(data, metadata);
				break;
			case 'LabelDate':
				all_data = process_label_date(data, metadata);
				break;
			case 'LabelDateFrequency':
				all_data = process_label_date_frequency(data, metadata);
				break;
			case 'GeocodeRegions':
				all_data = process_geocode_regions(data, metadata);				
			default:
				break;
		}
		return all_data;
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
		 * Given a dataset in TSV format, process it!
		 * 
		 * @param {String} Name of the dataset to process
		 * @param {Array} Array of data to process
		 * @param {Object} Metadata associated with this data
		 * @return {Object}
		 */
		processDatasetByName: function(dataset, data, metadata) {
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
			var all_data = process_data(dataset, data, metadata);
			return all_data;
		},
	}
})();
		
/**
 * Export the CNAParse API for NodeJS
 */
module.exports = CNAParse;

