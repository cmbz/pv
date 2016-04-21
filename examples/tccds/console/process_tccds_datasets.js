/** 
 * Process TCCDS datasets  
 *  
 * @author C. M. Boyd, ceilyn_boyd@harvard.edu
 * @copyright Harvard University Library
 * 
 * <b>Usage:</b> <code>node process_tccds_datasets</code>
 * Reads configuration from <code>./process_tccds_datasets</code>
 * 
 * Module dependencies
 * 
 * <b>ini:</b> https://npmjs.org/package/ini
 * <b>tccds:</b> tccds.js
 * 
 * Created: 17 April 2016
 * Last update: 17 April 2016
 */
// Load the nodejs filesystem module
var fs = require('fs');
// Load the nodejs ini module
var ini = require('ini');
// Load the underscore module
var _ = require('underscore');
// Load the TccdsParse module	
var tccds = require('./tccdsparse.js');

// Read and parse the TCCDS datasets ini file
var config = ini.parse(fs.readFileSync('./process_tccds_datasets.ini', 'utf-8'));
console.log('===Process TCCDS Datasets===');

// Object of source/destination dataset information, keyed on dataset name
var datasetNames = {
	'Drivers':{
		'source':'Driver_Mentions.txt',
		'destination_by_topic':{
			'source':null,
			'title': 'Driver Mentions by Topic',
			'about':'This dataset is an anonymized derivative of the original data about drivers for collections development identified during interviews and working group sessions. Dataset contains a list of drivers and their associated description and number of mentions.',
			'filename':'anonymized_drivers_by_topic.json',
		},
		'destination_by_mention': {
			'source':null,
			'title': 'Drivers by Frequency of Mentions',
			'about':'This dataset is an anonymized derivative of the original data about drivers for collections development identified during interviews and working group sessions. Dataset contains a list drivers grouped by their number of mentions.',
			'filename':'anonymized_drivers_by_mentions.json'
		},
	},
	'Trends':{
		'source':'Trend_Mentions.txt',
		'destination_by_topic':{
			'source':null,
			'title': 'Trend Mentions by Topic',
			'about':'This dataset is an anonymized derivative of the original data about trends for collections development identified during interviews and working group sessions. Dataset contains a list of all trends and their associated description and number of mentions.',		
			'filename':'anonymized_trends_by_topic.json',
		},
		'destination_by_mention':{
			'source':null,
			'title': 'Trends by Frequency of Mentions',
			'about':'This dataset is an anonymized derivative of the original data about trends for collections development identified during interviews and working group sessions. Dataset contains a list trends grouped by their number of mentions.',		
			'filename':'anonymized_trends_by_mentions.json',		
		},
	},
	'Engagement':{
		'source':'Engagement_Data.txt',
		'destination_by_topic': {
			'source':null,
			'title': 'Community Engagement Topic Mentions',
			'about':'This dataset is an anonymized derivative of the original data about issues identified as important during community engagement events. Dataset contains a list of topics and their associated number of mentions.',		
			'filename':'anonymized_engagement_by_topic.json',
		},
		'destination_by_mention':{
			'source':null,
			'title': 'Community Engagement Topics by Frequency of Mentions',
			'about':'This dataset is an anonymized derivative of the original data about trends for collections development identified during interviews and working group sessions. Dataset contains a list of topics grouped by their number of mentions.',						
			'filename':'anonymized_engagement_by_mentions.json',		
		}
	}
};

// Get the source directory
var source_dir = config.tccds.sourcedir;
// Get the destination directory
var dest_dir = config.tccds.destdir;

// Get the datasets to process
var datasets = _.keys(datasetNames);
datasets.forEach(function(dataset){
	console.log('Processing dataset: ' + dataset);
	var src = source_dir + '/' + datasetNames[dataset].source;
	var dest_topic = dest_dir + '/' + datasetNames[dataset].destination_by_topic.filename;
	var dest_topic_metadata = datasetNames[dataset].destination_by_topic;
	dest_topic_metadata.source = src;
	var dest_mentions = dest_dir + '/' + datasetNames[dataset].destination_by_mention.filename;
	var dest_mentions_metadata = datasetNames[dataset].destination_by_topic;
	dest_mentions_metadata.source = src;
	// read the data from the source file
	console.log('Reading: ' + src);
	var data = fs.readFileSync(src, 'utf8');
	// anonymize the data
	var anonymized_data_topics = tccds.processDataByTopic(dataset, data, dest_topic_metadata);
	var anonymized_data_mentions = tccds.processDataByMentions(dataset, data, dest_mentions_metadata);
	// write the data to a file
	console.log('Writing: ' + dest_topic);
	fs.writeFileSync(dest_topic, JSON.stringify(anonymized_data_topics), 'utf8');
	console.log('Writing: ' + dest_mentions);
	fs.writeFileSync(dest_mentions, JSON.stringify(anonymized_data_mentions), 'utf8');
});

console.log('===Complete===');





