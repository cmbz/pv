/** 
 * Oasis
 * 
 * A module of utilities to parse OASIS CSV files
 * 
 * @module Oasis
 * @author C. M. Boyd, ceilyn_boyd@harvard.edu
 * @copyright Harvard University Library
 * 
 * Module dependencies
 * moment.js
 * string.js
 * underscore.js
 * 
 * Created: 12 March 2015
 * Last update: 16 April 2016
 */

/**
 * The OASIS Parsing module definition
 */
var OasisParse = (function() {
	/** 
	 * Private properties
	 */
	
	/**
	 * Version
	 * 
	 * @property _version
	 * @type {String}
	 */
	var _version = '1.3';
	
	/**
	 * Valid row headers
	 * 
	 * Each header corresponds to a column in the input comma-delimited data.
	 * Whenever/if the format of the EAD CSV output data changes, this object must be changed
	 * to reflect those changes.
	 * 
	 * @property _row_headers
	 * @type {Object}
	 */
	var _row_headers = {
			'ID':0,
			'Unit Title':1,
			'Unit Date':2,
			'Start Year':3,
			'End Year':4,
			'Unit ID':5,
			'Level':6,
			'Originator 1':7,
			'Container 1':8,
			'Container 2':9,
			'Container 3':10,
			'Phys. Desc. 1':11,
			'Phys. Desc. 2':12,
			'Phys. Desc. 3':13,
			'Phys. Loc.':14,
			'Access Restrict.':15,
			'URN':16,
			'Collection Title':17,
			'Originator 2':18,
			'Collection Date':19,
			'Collection ID':20,
			'Parent 1':21,
			'Parent 2':22,
			'Parent 3':23,
			'Parent 4':24,
			'Parent 5':25,
			'Parent 6':26,
	};
	
	/**
	 * Pretty labels for stats object fields
	 * 
	 * Properties: 
	 * 	brief - brief description
	 * 	full - full desdription
	 * 	suffix - string to add to end of value, if needed (e.g. %)
	 * 
	 * @property _stats_labels
	 * @type {Object}
	 */
	var _stats_labels = {
		    'component_count': {'brief':'# components','full':'Total number of components','suffix':''},
		    'earliest_date': {'brief':'Earliest date','full':'Earliest date','suffix':''},
		    'latest_date': {'brief':'Latest date','full':'Latest date','suffix':''},
		    'digital_objects_count': {'brief':'# digital','full':'Total number of digital components','suffix':''},
		    'single_date_count': {'brief':'# single date','full':'Total number of components covering a single date','suffix':''},
		    'range_count': {'brief':'# range','full':'Total number of components covering a date range','suffix':''},
		    'no_date_count': {'brief':'# no dates','full':'Total number of components without start/end dates','suffix':''},
		    'start_dist': {'brief':'Start date distribution','full':'Distribution of components by start date','suffix':''},
		    'end_dist': {'brief':'End date distribution','full':'Distribution of components by end date','suffix':''},
		    'percent_digital': {'brief':'% digital','full':'Percentage of digital components','suffix':'%'},
		    'percent_nondigital': {'brief':'% nondigital','full':'Percentage of nondigital components','suffix':'%'},
		    'percent_single_date': {'brief':'% single date','full':'Percentage of single date components','suffix':'%'},
		    'percent_range': {'brief':'% range','full':'Percentage of components covering a range','suffix':'%'},
		    'percent_no_date': {'brief':'% no date','full':'Percentage of components without start/end date','suffix':'%'},
	};
	
	/**
	 * Valid HTML class names
	 * 
	 * Used to format the vis item in timeline user interface
	 * 
	 * @property _classnames
	 * @type {Object}
	 */
	var _classnames = {
			'digital':'digital',
			'nondigital':'nondigital'
	};

	/**
	 * Object containing all items,
	 * and information about items, 
	 * keyed on item id.
	 * 
	 * @property _items
	 * @type {Object}
	 */
	var _items = null;
	
	/**
	 * Object containing statistics about
	 * the finding aid CSV data
	 * 
	 * @property _stats
	 * @type {Object}
	 */
	var _stats = null;
	
	/**
	 * Private methods
	 */
		
	/**
	 * Prepare an array of data to be processed
	 * 
	 * (specifically, remove any leading blank rows)
	 */
	prepare_data = function(data) {
		// validate parameter
		if ((data == null) || (_.isUndefined(data))) {
			return null;
		}
		// create a variable to hold the processed rows
		var rows = new Array();
		// traverse each row, removing blank rows
		for (var i = 0; i < data.length; i++) {
			if (data[i].length >= 1) {
				rows.push(data[i]);
			}
		}
		// return the rows with content in them
		return rows;
	},
	
	/**
	 * Given start and end strings, return an object that
	 * contains information about the duration between them.
	 * 
	 * Date strings are parsed using the moment.js library.
	 * 
	 * @param {String} Start date
	 * @param {String} End date
	 * @return {Object}
	 */
	get_duration = function (start, end) {
		// validate parameters
		if ((start == null) || (_.isUndefined(start))) {
			return null;
		}
		
		// create the duration object
		var duration = new Object();
		
		// if there is no end date or the start and end are identical
		if ((end == '') || (start == end)) {
			duration['days'] = 0;
			duration['years'] = 0;
			return duration;
		}
		
		// create a moment for the start date
		var sm = moment(start);
		if (sm.isValid() == false) {
			console.log('Error: bad start date: ' + sm.format());
			return duration;
		}
		
		// create a moment for the end date
		var em = moment(end);
		if (em.isValid() == false) {
			console.log('Error: bad end date: ' + end);
			return duration;			
		}
		
		// calculate the difference between the start and end in days
		var diff_days = em.diff(sm, 'days');
		// calculate the difference between the start and end in years
		var diff_years = em.diff(sm, 'years');
		
		// set the difference on the duration object
		duration['days'] = diff_days;
		duration['years'] = diff_years;
		
		// return
		return duration;
	},
	
	/**
	 * Given some data, process it and
	 * create an item suitable for display using
	 * the Vis.js library
	 * 
	 * @param {Object}
	 * @return {Object}
	 */
	process_item = function(data) {
		// validate parameter
		if ((_.isUndefined(data)) || 
			(data == null)) {
			return null;
		}
		// create new object
		var item = new Object();
		// generate a unique id for this item
		item['id'] = data['id'];
		// assign the classname
		item['className'] = data['className'];
		// assign the start date
		var sm = moment(new Array(data['start_year']));
		item['start'] = ((data['start_year'] == '') || (sm.format('YYYY-MM-DD') == 'Invalid date')) ? '' : sm.format('YYYY-MM-DD');
		// assign the end date
		var em = moment(new Array(data['end_year']));
		item['end']= ((data['end_year'] == '') || (em.format('YYYY-MM-DD') == 'Invalid date')) ? '' : em.format('YYYY-MM-DD');
		// calculate the duration between start and end dates
		var duration = get_duration(item['start'], item['end']);
		// if the duration is > 1 year, then create a range, otherwise, settle for a point
		item['type'] = (duration['years'] >= 2) ? 'range' : 'point';
		// set the content for the item
		item['content'] = data['unit_title'];
		// set the title/tooltip for the item
		item['title'] = (data['unit_title'] == '') ? '[blank]' + ' (id =' + data['id'] + ')' : data['unit_title'];
		// set the urn
		item['urn'] = data['urn'];
		// assign the unit date
		item['unit_date'] = data['unit_date'];
		// assign the collection information 
		item['collection'] = data['collection_title'];
		if (data['parent_1']) {
			item['collection'] = item['collection'] + ' &#10940; ' + data['parent_1'];
		}
		if (data['parent_2']) {
			item['collection'] = item['collection'] + ' &#10940; ' + data['parent_2'];
		}
		if (data['parent_3']) {
			item['collection'] = item['collection'] + ' &#10940; ' + data['parent_3'];
		}
		// return the item
		return item;
	},
	
	/**
	 * Process a row of CSV data
	 * 
	 * @param {String} Row data
	 * @return {Boolean}
	 */
	process_row = function(row) {
		// validate parameters
		if ((_.isUndefined(row)) ||	row == null || 
			(_.isString(row) == false)) {
			return null;
		}
		
		// break string into columns
		var columns = S(row).parseCSV(',','"');
		
		// create an object to hold the data from the parsed row
		var data = new Object();
		
		//
		// assign values to properties on the object for later use
		//
		
		// assign the id
		var id_index = _row_headers['ID'];
		data['id'] = columns[id_index];
		// assign the unit title
		var unit_title_index = _row_headers['Unit Title'];
		data['unit_title'] = columns[unit_title_index];
		// assign the unit date
		var unit_date_index = _row_headers['Unit Date'];
		data['unit_date'] = columns[unit_date_index];	
		// assign the start year
		var start_year_index = _row_headers['Start Year'];
		data['start_year'] = columns[start_year_index];	
		// assign the end year
		var end_year_index = _row_headers['End Year'];
		data['end_year'] = columns[end_year_index];
		// assign the urn
		var urn_index = _row_headers['URN'];
		data['urn'] = columns[urn_index];
		// assign the HTML classname
		data['className'] = (data['urn'] != '') ? _classnames['digital'] : _classnames['nondigital'];
		// assign the collection title
		var collection_title_index = _row_headers['Collection Title'];
		data['collection_title'] = columns[collection_title_index];
		// assign the parent 1 
		var parent_1_index = _row_headers['Parent 1'];
		data['parent_1'] = columns[parent_1_index];
		// assign the parent 2
		var parent_2_index = _row_headers['Parent 2'];
		data['parent_2'] = columns[parent_2_index];
		// assign the parent 3
		var parent_3_index = _row_headers['Parent 3'];
		data['parent_3'] = columns[parent_3_index];
		//
		// process the item embodied within this row
		//
		// create the item
		var item = process_item(data);
		// add the item to the Object of items
		var item_id = item['id'];
		_items[item_id] = item;
		//
		// update the statistics
		//
		// increment the total number of components
		_stats['component_count']++;
		// if we have a valid start date, set the earliest date
		if (item['start'] != '') {
			if ((_stats['earliest_date'] == null) || 
				(_.isUndefined(_stats['earliest_date'])) &&
				(_.isUndefined(data['start_date']) == false)) {
				_stats['earliest_date'] = data['start_year'];
			} else if (data['start_year'] < _stats['earliest_date']) {
				_stats['earliest_date'] = data['start_year'];
			}
		}
		// if we have a valid end date, set the latest date
		if (item['end'] != '') {
			if ((_stats['latest_date'] == null) || 
				(_.isUndefined(_stats['latest_date'])) &&
				(_.isUndefined(data['end_date']) == false)) {
				_stats['latest_date'] = data['end_year'];
			} else if (data['end_year'] > _stats['latest_date']) {
				_stats['latest_date'] = data['end_year'];
			}
		}
		// increment the digital object count, if necessary
		// add to the list of digital objects, if necessary
		if (item['urn'] != '') {
			_stats['digital_objects_count']++;
			var entry = {
							'title': item['title'],
							'urn':	item['urn'],
							'start': item['start'],
							'end': item['end']
			};
			_stats['digital_objects_list'].push(entry);
		}
		// increment single date or range counts
		if (item['start'] == item['end']) {
			_stats['single_date_count']++;
		} else {
			_stats['range_count']++;
		}
		// update the start date distribution (remember to use the item start because it handles invalid raw dates!)
		if (item['start'] != '') {
			if (_.isUndefined(data['start_year']) == false) {
				// check to see if the start year is in the stats distribution
				var start = data['start_year'];
				if (_.isUndefined(_stats['start_dist'][start])) {
					_stats['start_dist'][start] = 0;
				}
				_stats['start_dist'][start]++;
			}
		}
		// update the end date distribution (remember to use the item end because it handles invalid dates!)
		if (item['end'] != '') {
			if (_.isUndefined(data['end_year']) == false) {
				// check to see if the start year is in the stats distribution
				var end = data['end_year'];
				if (_.isUndefined(_stats['end_dist'][end])) {
					_stats['end_dist'][end] = 0;
				}
				_stats['end_dist'][end]++;		
			}
		}
		// update no date count
		if ((item['start'] == '')|| (item['end'] == '')) {
			_stats['no_date_count']++;
		}
		// return the item
		return item;
	}
	
	/**
	 * Return the Oasis API
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
		 * Get the items (keyed on item id)
		 * 
		 * @return {Object}
		 */
		getItems: function() {
			return _items;
		},
		
		/**
		 * Get the finding aid statistics
		 * 
		 * @return {Object}
		 */
		getStatistics: function() {
			return _stats;
		},
		
		/**
		 * Given an item id, return HTML formatted item information
		 * 
		 * @param {String} Item Id
		 * @param {String} Array of keys=value pairs containing instructions for how to format to HTML 
		 */
		getItemHTML: function(itemId) {
			// validate parameter
			if ((_.isUndefined(itemId)) || 
				(itemId == null) || 
				(_.isUndefined(_items[itemId]))) {
				return '';
			}
			// get the item, then build components of the HTML string
			var item = _items[itemId];
			var content = item['content'];
			var date_str = item['unit_date'];
			var link = (item['urn']) ? '<a class="' + _classnames['digital'] + '" target="_blank" href="' + item['urn'] + '">' + item['urn'] + '</a>' : '';
			var title = (item['urn']) 
						? '<a class="' + _classnames['digital'] + '" target="_blank" href="' + item['urn'] + '">' + item['title'] + '</a>' 
						: item['title'];
			var html = new Array();
			html.push('<ul>');
			html.push('<li><em>Title:</em> ' + title + '</li>');
			html.push('<li><em>Collection:</em> ' + item['collection'] + '</li>');
			html.push('<li><em>Date:</em> ' + item['unit_date'] + '</li>');
			if (item['urn']) {
				html.push('<li><em>Link:</em> ' + link + '</li>');
			}
			html.push('</ul>');
			return html.join('');
		},
		
		/**
		 * Return an HTML string containing a list of statistics about the
		 * finding aid
		 * 
		 * @param {String} brief or full
		 * @return {String}
		 */
		getStatisticsHTML: function(option) {
			var opt = ((option == null) || (_.isUndefined(option))) ? 'brief' : option;
			var html = new Array();
			var keys = _.keys(_stats);
			html.push('<ul>');
			keys.forEach(function(key, index, array){
				if ((key != 'digital_objects_list') &&
					(key != 'start_dist') &&
					(key != 'end_dist')) {
					var str = '<li><em>' + _stats_labels[key][opt] + '</em>: ' + _stats[key] + _stats_labels[key]['suffix'] + '</li>';
					html.push(str);
				}
			});
			html.push('</ul>');
			return html.join('');
		},
		
		/**
		 * Return an HTML string containing a table statistics about the
		 * finding aid
		 * 
		 * @param {String} brief or full
		 * @return {String}
		 */
		getStatisticsTableHTML: function(option) {
			var opt = ((option == null) || (_.isUndefined(option))) ? 'brief' : option;
			var html = new Array();
			var keys = _.keys(_stats);
			html.push('<table class="oasisStats">');
			html.push('<tr><th class="oasisStats">Category Name</th><th class="oasisStats">Value</th></tr>')
			keys.forEach(function(key, index, array){
				if ((key != 'digital_objects_list') &&
					(key != 'start_dist') &&
					(key != 'end_dist')) {
					var str = '<tr><td class="oasisStats">' 
									+ _stats_labels[key][opt] 
									+ '</td><td class="oasisStats">' 
									+ _stats[key] + _stats_labels[key]['suffix'] 
									+ '</td></tr>';
					html.push(str);
				}
			});
			html.push('</table>');
			return html.join('');
		},
		
		/**
		 * Given an item id, determine if it is valid or not 
		 * (whether it is part of original dataset)
		 * 
		 * @param {String}
		 * @return {Boolean}
		 */
		isValidItemId: function(itemId) {
			// if there are no items or the id returns undefined
			if ((_items == null) || 
				(_.isUndefined(_items[itemId]))) {
				return false;
			}
			return true;
		},
		
		/**
		 * Process the finding aid data (format is a string)
		 * 
		 * @param {Boolean} Data has a header (or not)
		 * @param {String} String of rows of data
		 * @return Boolean Returns true, on success, if the processing of any row fails
		 */
		processData: function(header, data) {
			// validate parameter
			if ((_.isUndefined(data)) || (_.isString(data) == false)) {
				return false;
			}
			
			// create the items
			_items = new Object();
			
			//
			// initialize the statistics
			//
			_stats = {};
			// create the stats object
			// total number of components
			_stats['component_count'] = 0;
			// earliest date in the finding aid
			_stats['earliest_date'] = null;
			// latest date in the finding aid
			_stats['latest_date'] = null;
			// total number of digital objects
			_stats['digital_objects_count'] = 0;
			// total number of single date components
			_stats['single_date_count'] = 0;
			// total number of range components
			_stats['range_count'] = 0;
			// total number of components without dates
			_stats['no_date_count'] = 0;
			// distribution of components based upon start date
			_stats['start_dist'] = new Object();
			// distribution of components based upon end date
			_stats['end_dist'] = new Object();
			// list of information about all digital objects
			_stats['digital_objects_list'] = new Array();
			// percent digital
			_stats['percent_digital'] = 0;
			// percent nondigital
			_stats['percent_nondigital'] = 0;
			// percent single date
			_stats['percent_single_date'] = 0;
			// percent range 
			_stats['percent_range'] = 0;
			// percent no-date
			_stats['percent_no_date'] = 0;

			// remove any blank lines
			var rows = prepare_data(data.split('\n'));
			// if there is a header row, remove it
			if (header) {
				rows.shift();
			}
			
			// process each row
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				// process each row
				var ret = process_row(row);
				if (ret == null) {
					console.log('Error: null item at row ' + i + ' - string: ' + row);
					return false;
				}
			}
			
			// update remaining statistics
			_stats['percent_digital'] = Math.round((_stats['digital_objects_count'] / _stats['component_count']) * 100);
			_stats['percent_nondigital'] = Math.round((((_stats['component_count']) - (_stats['digital_objects_count'])) / _stats['component_count']) * 100);
			_stats['percent_single_date'] = Math.round((_stats['single_date_count'] / _stats['component_count']) * 100);
			_stats['percent_range'] = Math.round((_stats['range_count'] / _stats['component_count']) * 100);
			_stats['percent_no_date'] = Math.round((_stats['no_date_count'] / _stats['component_count']) * 100);
			
			return true;
		},
		
		/**
		 * Return an HTML string containing warning information about the
		 * timeline. If there are no warnings, null is returned.
		 * 
		 * @param {Void}
		 * @return {String}
		 */
		getTimelineWarningsHTML: function() {
			var warn = false;
			var html = new Array();
			html.push('<ul>');
			// check for unexpected dates
			var ed = moment(new Array(_stats['earliest_date']));
			if (ed.format('YYYY-MM-DD') == '0001-01-01') {
				warn = true;
				html.push('<li>An unusual earliest was found: ' + _stats['earliest_date'] + ' which translates to: ' + ed.format('YYYY-MM-DD') + '. This <em>may</em> indicate an error in the original data. Examine the start dates in the finding aid CSV file.</li>');
			}			
			var ld = moment(new Array(_stats['latest_date']));
			if (ld.format('YYYY-MM-DD') == '0001-01-01') {
				warn = true;
				html.push('<li>An unusual latest was found: ' + _stats['latest_date'] + ' which translates to: ' + ld.format('YYYY-MM-DD') + '. This <em>may</em> indicate an error in the original data. Examine the end dates in the finding aid CSV file.</li>');
			}
			// check for empty items object
			if (_.isEmpty(_items)) {
				warn = true;
				html.push('<li>No components were located in the finding aid, therefore no items could be added to the timeline.</li>');
			}
			// check for no start/end data (meaning, nothing plottable)
			if (_.isEmpty(_stats['start_dist'])) {
				warn = true;
				html.push('<li>This timeline is empty. No components having valid start dates were located in the finding aid, therefore no components could be added to the timeline.</li>');	
			}
			// check the interval between ealiest and latest dates, if greater than 500 (years) warn
			if ((Math.abs(_stats['latest_date'] - _stats['earliest_date'])) > 500) {
				warn = true;
				html.push('<li>This timeline spans more than 500 years.');
			}
			// check the number of items in the timeline, if greater than 1000, warn
			var keys = _.keys(_items);
			if (keys.length > 1000) {
				warn = true;
				html.push('<li>This finding aid has more than 1000 components; timeline performance may be affected if they are plottable.</li>');
			}
			html.push('</ul>');
			if (warn) {
				return html.join('');
			}
			return null;
		}
	};
})();
