/** 
 * Process CNA datasets  
 *  
 * @author C. M. Boyd, ceilyn_boyd@harvard.edu
 * @copyright Harvard University Library
 * 
 * <b>Usage:</b> <code>node process_cna_datasets</code>
 * Reads configuration from <code>./process_cna_datasets</code>
 * 
 * Module dependencies
 * 
 * <b>ini:</b> https://npmjs.org/package/ini
 * <b>cna:</b> cna.js
 * 
 * Created: 18 April 2016
 * Last update: 18 April 2016
 */
// Load the nodejs filesystem module
var fs = require('fs');
// Load the nodejs ini module
var ini = require('ini');
// Load the underscore module
var _ = require('underscore');
// Load the cnaParse module	
var cna = require('./cnaparse.js');

// Read and parse the CNA datasets ini file
var config = ini.parse(fs.readFileSync('./process_cna_datasets.ini', 'utf-8'));
console.log('===Process CNA Datasets===');

// Object of source/destination dataset information, keyed on dataset name
var datasetNames = {
	'LanguageFrequency':{
		'source':'inventory_all_data_04_13_2016.txt',
		'metadata': {
			'name': 'by_collection_language_frequency',
			'source':null,
			'title': 'Frequency by Language Assigned to Collection',
			'about':'This dataset is a subset of the original and contains all digitized objects arranged by frequency of the lanaguage assigned to the collection to which they belong.',
			'filename':'frequency_by_language.json',
		},
	},
	'SubjectFrequency':{
		'source':'inventory_all_data_04_13_2016.txt',
		'metadata': {
			'name': 'by_subject_frequency',
			'source':null,
			'title': 'Frequency by Survey Subject Area Assigned to Collection',
			'about':'This dataset is a subset of the original and contains all digitized objects arranged by frequency of the survey subject area assigned to the collection to which they belong.',
			'filename':'frequency_by_subject.json',
		},
	},
	'NarrowSubjectFrequency':{
		'source':'inventory_all_data_04_13_2016.txt',
		'metadata': {
			'name': 'by_narrow_subject_frequency',
			'source':null,
			'title': 'Frequency by Narrow Survey Subject Area Assigned to Collection',
			'about':'This dataset is a subset of the original and contains all digitized objects arranged by frequency of the more narrow survey subject area assigned to the collection to which they belong.',
			'filename':'frequency_by_narrow_subject.json',
		},
	},
	'RegionFrequency':{
		'source':'inventory_all_data_04_13_2016.txt',
		'metadata': {
			'name': 'by_region_frequency',
			'source':null,
			'title': 'Frequency by Survey Geographical Region Assigned to Collection',
			'about':'This dataset is a subset of the original and contains all digitized objects arranged by frequency of the survey region assigned to the collection to which they belong.',
			'filename':'frequency_by_region.json',
		},
	},
	'LabelDate':{
		'source':'inventory_all_data_04_13_2016.txt',
		'metadata': {
			'name': 'by_label_date',
			'source':null,
			'title': 'Significant Date Associated with the Label of a Digital Object',
			'about':'This dataset is a subset of the original and contains all digitized objects and an associated significant date in its METS label.',
			'filename':'label_date.json',
		},
	},
	'LabelDateFrequency':{
		'source':'inventory_all_data_04_13_2016.txt',
		'metadata': {
			'name': 'by_label_date_frequency',
			'source':null,
			'title': 'Frequency of Significant Dates Associated with the Label of a Digital Object',
			'about':'This dataset is a subset of the original and contains the frequency of specific, significant dates in the METS label associated with all digitized objects.',
			'filename':'label_date_frequency.json',
		},
	},
	'GeocodeRegions':{
		'source':'inventory_all_data_04_13_2016.txt',
		'metadata': {
			'name': 'by_geocoded_regions',
			'source':null,
			'title': 'Items Grouped with Assigned Geocoding',
			'about':'This dataset is a subset of the original and contains digital objects with their associated geocoded region.',
			'filename':'geocode_regions.json',
		},
	},
};

// Get the source directory
var source_dir = config.cna.sourcedir;
// Get the destination directory
var dest_dir = config.cna.destdir;

// Get the datasets to process
var datasets = _.keys(datasetNames);
datasets.forEach(function(dataset){
	console.log('Processing dataset: ' + dataset);
	var src = source_dir + '/' + datasetNames[dataset].source;
	var dest = dest_dir + '/' + datasetNames[dataset].metadata.filename;
	var dest_metadata = datasetNames[dataset].metadata;
	dest_metadata.source = src;
	// read the data from the source file
	console.log('Reading: ' + src);
	var data = fs.readFileSync(src, 'utf8');
	// create the dataset
	var dataset_data = cna.processDatasetByName(dataset, data, dest_metadata);
	// write the data to a file
	console.log('Writing: ' + dest);
	fs.writeFileSync(dest, JSON.stringify(dataset_data), 'utf8');
});

console.log('===Complete===');





