# Readme #

Welcome to the code and documents associated with the **Practical Data\* Visualization with JavaScript** talk given by Ceilyn Boyd (ceilyn_boyd@harvard.edu) on 4/25/2016.

## About the Talk ##

This talk introduces a methodology intended to help you decide:

- When to use programming techniques to visualize your data (and when to choose alternate means, e.g. Excel Pivot Charts);
- What data, or aspects of your data to render visually, and
- How best to use the programming tools at your disposal to visualize your data.

The hands-on programming examples will use JavaScript and emphasize user interactivity, however the decision-framework is language agnostic. Examples will also involve data of interest to library audiences. Topics covered include:

- Workflows
	- Developing data analysis and visualization workflows
- Working with data:
	- Data structures and data modeling;
	- What kinds of library data and circumstances make for good visualization candidates;
	- Strategies for working with data from different sources.
- Visual presentation:
	- Visualization techniques, what and when to use them;
	- Heuristics for creating good visualizations.

I have provided a lot of non-toy examples in the code described in the directory structure below that will hopefully demonstrate the above topics.

## Requirements ##

### Browser ###
The code examples have been tested on FireFox, Opera, and Chrome. 

I was **NOT** successful getting the examples to work on **Internet Explorer 11**.

N.B: The examples have **not** been tested on any mobile device; they probably will **not** work well on mobile devices.

### Web Server ###

To install, run, and/or modify these examples, you will need to have access to a machine with a running Web server.

Modify the URL in `~/pv/js/config.js` to reflect the name of your Web server. For instance, on my machine, the server name is: `http://localhost`, which is the default in the `config.js` file.

**Macs**

If you are using a Mac, Mac OS X has a default web server available to you. Typically, you install your code into the `~/Sites` directory and let Mac OS do the rest for you. If you installed `~/pv` into `~/Sites`, you will be able to access the examples through the URL: `http://localhost/pv/index.html`

For a console, use the Mac **Terminal.app** program, usually located in your `~/Applications` directory.

**Windows**

I use **WampServer** ([http://www.wampserver.com/en/](http://www.wampserver.com/en/ "WampServer")) on Windows 7 Enterprise. 

For a console, I use, **ConEmu** ([https://conemu.github.io/](https://conemu.github.io/)).

**Linux**

Many Linux distributions contain a default LAMP stack. Check the installation instructions for your version of Linux to configure and start-up your Web server.

### Node.js ###

To run the Node.js console applications in order to generate datasets, you will also need to install Node.js and several modules upon which the console applications depend.

Fortunately, Node.js is very easy to install. Documentation is available here: 
[https://nodejs.org/en/](https://nodejs.org/en/). Download the version appropriate for you architecture. Then, follow the installation instructions.

**Installing CNA Console App Node.js Modules**

The CNA Node.js console application makes use of the modules shown below. To install each, open a console window, change directory to ~/pv/examples/cna/console and type the following:

- `fs`: This module handles file input/output and is installed by default when you install Node.js
- `ini.js`: [https://github.com/npm/ini](https://github.com/npm/ini)
	- `npm install ini <ret>`
- `moment.js`: This module handles date and time processing. [http://momentjs.com/](http://momentjs.com/)
	- `npm install moment <ret>`
- `string.js`: This module contains a variety of string processing utilities, including a simple CSV/TSV parser used in the `~/pv` code. [http://stringjs.com/](http://stringjs.com/)
	- `npm install string <ret>`
- `underscore.js`: Like string.js, this module contains a variety of utilities for processing JavaScript objects, arrays, and string. It is used widely in the `~/pv` code. [http://underscorejs.org/](http://underscorejs.org/)
	- `npm install underscore <reg>`
- `XRegExp.js`: This module supposed parsing of regular expressions and is used to extract dates from the labels on CNA digital objects. [http://xregexp.com/](http://xregexp.com/)
	- `npm install xregexp <reg>`

Once you install these modules, a new directory will be created called `~/pv/examples/cna/console/node_modules`. Don't delete it; the console app will make use of these modules to generate the datasets.


## Directory Structure ##
The full structure of the **Practical Data Visualization in JavaScript** code examples is described in detail below. Indentations give you a sense of the directory hierarchy.

- **`~/pv`**
	- Base directory for all code and documentation
	- `index.css`
		- CSS file for the index page for the presentation
	- `index.html`
		- HTML file for the index page for the presentation. All examples are linked from this page.
	- `readme.md`
		- This file, the Mark Down readme file for the entire code base

- **`~/pv/docs`**
	- Documentation directory, including presentation 
- **`~/pv/examples`**
	- Directory containing code for all examples: *Colonial North American* (CNA), *Towards a Collections & Content Development Strategic Plan* (TCCDS), and the *OASIS Finding Aid Viewer* (OASIS)
- **`~/pv/examples/cna`**
	- Directory containing code for the Colonial North American Project (CNA) examples
	- **`~/pv/examples/cna/console`**
		- Node.js source code
			- `cnaparse.js`
				- Module containing code to parse the TSV datafile: `~/pv/examples/data/cna/inventory_all_data_04_13_2016.txt`
			- `process_cna_datasets.ini`
				- Ini file used to configure `cnaparse.js`
			- `process_cna_datasets.js`
				- Console application that reads the INI file and source datafile `~/pv/examples/data/cna/inventory_all_data_04_13_2016.txt` and generates CNA JSON datasets to be stored in `~/pv/examples/data/cna`
	- `~/pv/examples/cna/cna.css`
		- Simple CSS file for the CNA examples
	- `~/pv/examples/cna/cna_distribution_by_date.html`
		- This plot illustrates the number of unique, significant dates associated with digitized items. For most collections, an interval was identified by the surveyor indicating an earliest and latest date for the collection. Each digitized item will be associated with a date (or date range) somewhere within that interval. 
		This plot does not handle date ranges, but instead assigns a single date (the earliest) for ease of plotting.
	- `~/pv/examples/cna/cna_distribution_by_language.html`
		- This plot shows the frequency of languages associated with collections having digitized content.</li>
	- `~/pv/examples/cna/cna_distribution_by_narrow_subject.html`
		- In addition to the primary, broad survey subject 
		areas shown above, the surveyor also identified some special, more narrow, subjects as well. This plot shows the frequency of these narrow subject areas identified 
		in the survey associated with collections having digitized content. This visualization uses the HTML5 canvas element and shows some of the limitations
		of radar charts.
	- `~/pv/examples/cna/cna_distribution_by_region.html`
		- This plot shows the frequency of regions identified in the survey associated with collections having digitized content.
	- `~/pv/examples/cna/cna_distribution_by_subject.html`
		- This plot shows the frequency of subject areas identified in the 
		survey associated with collections having digitized content.
	- `~/pv/examples/cna/cna_geocode_regions.html`
		- Illustration using the Google Maps API of the region data. 
		Requires a Google Maps API key, and therefore may not render properly unless you supply a valid one for your server.
- **`~/pv/examples/data`**
	- Directory where source data for **all** examples is stored. Node.js console applications also write files to these sub-directories.The name of the directory should be self-explanatory. The description, purpose, and structure of these individual files is described in greater detail in the Readme section called: **Data File Formats**.
		- `~/pv/examples/data/cna`: **CNA datasets**
			- `cna_region_geocode.txt`: hand-coded file containing coordinates for each of the CNA survey geographical regions
			- `frequency_by_language.json`: output of Node.js application `process_cna_datasets.js`
			- `frequency_by_narrow_subject.json`: output of Node.js application `process_cna_datasets.js`
			- `frequency_by_region.json`: output of Node.js application `process_cna_datasets.js`
			- `frequency_by_subject.json`: output of Node.js application `process_cna_datasets.js`
			- `geocode_regions.json`: output of Node.js application `process_cna_datasets.js`
			- `inventory_all_data_04_13_2016.txt`: output of an MS-Access query
			- `label_date.json`: output of Node.js application `process_cna_datasets.js`
			- `label_date_frequency.json`: output of Node.js application `process_cna_datasets.js`
		- `~/pv/examples/data/oasis`: **OASIS datasets**. All of these files were created automatically using OASIS's CSV download tool
			- `div00407.csv`: Philadelphia Universalist Convention. Records, 1789-1807
			- `div00579.csv`: Parsons, Jonathan, 1705-1776. Sermons, ca. 1727-1772.
			- `hou00108.csv`: Joseph Dennie Papers, 1783-1815.
			- `hua04010.csv`: Records of Grants for Work among the Indians, 1720-1812.
			- `hua07010.csv`: Papers of John and Hannah Winthrop, 1728-1789.
			- `med00230.csv`: Papers of John Winthrop, 1651-1879.
		- `~/pv/examples/data/tccds`: **TCCDS datasets**. These files are all the output of the Node.js application `process_tccds_datasets.js` and make use of CSV datasets that are private and have not been distributed.
			- `anonymized_trends_by_topic.json`
			- `anonymized_trends_by_mentions.json`
			- `anonymized_engagement_by_topic.json`
			- `anonymized_engagement_by_mentions.json`
			- `anonymized_drivers_by_topic.json`
			- `anonymized_drivers_by_mentions.json`
- **`~/pv/examples/oasis`**
	- Directory containing code for the OASIS Timeline Viewer
	- `~/pv/examples/oasis/oasis.css`
		- Simple CSS file for the OASIS viewer
	- `~/pv/examples/oasis/oasis.html`
		- HTML file for the OASIS viewer
	- `~/pv/examples/oasis/oasis.js`
		- JavaScript module containing code for reading, parsing, and transforming data associated with CSV finding aid components, and managing/controling the timeline viewer UI element
- **`~/pv/examples/tccds`**
	- Directory containing code for the Towards a Collections & Content Development Strategic Plan (TCCDS) examples
	- **`~/pv/examples/tccds/console`**
		- **Note:** This directory contains the console application (and related Ini file) that anonymizes TCCDS datasets. It is being made available here for completeness, however the datasets it operates on are private (because they contain personal identifying characteristics) and will not be made available online.
	- `~/pv/examples/tccds/tccds.css`
		- Simple CSS file for all TCCDS visualizations
	- `~/pv/examples/tccds/tccds_drivers.html`
		- HTML file containing code for visualizations depicting information about drivers of collecting practices
	- `~/pv/examples/tccds/tccds_engagement.html`
		- HTML file containing code for visualizations depicting comments from the community and others about trends/issues around collecting.
	- `~/pv/examples/tccds/tccds_trends.html`
		- HTML file containing code for visualizations depicting information about trends in collecting practices
- `**~/pv/js`**
	- Directory containing a single file to support configuration for all examples.
	- `config.js`
		- This file contains a very simple module that allows the examples to work without having to use a full JavaScript framework such as Backbone.js or Angular.js. Edit the URL in this file to point to the URL on your server where you have installed the `~/pv` code.


## Data File Formats ##

The directory: `~/pv/examples/data` contains source and destination datasets for all of the examples. The structure of each of these files is described in greater detail below.

### CNA Datasets ###

All CNA datasets are located here:  `~/pv/examples/data/cna`.

**CNA TSV Files**

`cna_region_geocode.txt`: hand-coded TSV file containing coordinates for 11 of the CNA survey geographical regions. Columns/fields are:

1. Region
1. Latitude
1. Longitude

`inventory_all_data_04_13_2016.txt`: output of an MS-Access query. This TSV file contains 5,956 rows of data, each representing a CNA digital object. 38 fields are used to describe each of the digital objects.

**CNA JSON Files**

All CNA JSON files have the same, basic top level structure:

    {
    	'metadata':{object containing metadata},
    	'data':{object containing data}
    }

`frequency_by_language.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    					'pretty_languages': [Array of prettified language names],
    					'num_languages': <integer>,
						'marc_language_lookup':{Object containing lookup table linking marc language names to pretty names},
    	},
    	'data':{
					'marc_lang_1': {
									  'mentions':<# digital objects tagged with marc_lang_1>,
									  'objects':[Array of digital objects tagged with marc_lang_1] },
				    # more languages below
    	},			
    }

`frequency_by_narrow_subject.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    					'subjects': [Array of subjects mentioned],
    	},
    	'data':{
    					'subject_1': {
    									  'mentions':<# digital objects tagged with subject_1>,
    									  'objects':[Array of digital objects tagged with subject_1] },
				    # more narrow subjects below
    	},			
    }


`frequency_by_region.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    					'regions': [Array of regions mentioned],
						'num_regions': <integer number of regions mentioned>
    	},
    	'data':{
    					'region_1': {
    									  'mentions':<# digital objects tagged with region_1>,
    									  'objects':[Array of digital objects tagged with region_1] },
				    # more regions below
    	},			
    }

`frequency_by_subject.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    					'subjects': [Array of subjects mentioned],
    	},
    	'data':{
    					'subject_1': {
    									  'mentions':<# digital objects tagged with subject_1>,
    									  'objects':[Array of digital objects tagged with subject_1] },
				    # more subjects below
    	},			
    }

`geocode_regions.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    					'num_items': [total # items with associated region geocode],
						'region_geocodes':{Lookup table of geocodes, keyed on region},
    	},
    	'data':{
    					'item_1': [region-latitude, region-longitude]
				    	# more items below
    	},			
    }
 
`label_date.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    	},
    	'data':{
    					'item_1': {
									'date':<significant date>,
									'url':<URL for the digital object>,
									'ead':<URL for the EAD, if any>,
									'owner':<owning repository>,
					},
				    # more items below
    	},			
    }

`label_date_frequency.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>,
						'num_dates':<# unique dates>
    	},
    	'data':{
    					'date_1': <# of digital objects associated with date>,
				   		# more dates below
    	},			
    }


### Towards a Collections & Content Development Strategy (TCCDS) Datasets ###

All TCCDS datasets are located here: `~/pv/examples/data/tccds`. These files are all the output of the Node.js application `process_tccds_datasets.js` and make use of a dataset that is private and has not been distributed.

All TCCDS JSON files have the same, basic top level structure:

    {
    	'metadata':{object containing metadata},
    	'data':{object containing data}
    }

`anonymized_trends_by_topic.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    	},
    	'data':{
    					'trend_1': [ #array of trend objects
								{
									'name':<trend name>,
									'description:<trend description>,
									'mentions':<# mentions>
								},
								# more trend objects below
					},
				    # more mention trends below
    	},			
    }

`anonymized_trends_by_mentions.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    	},
    	'data':{
    					'1': [ #array of trend objects
								{
									'name':<trend name>,
									'description:<trend description>,
									'mentions':<# mentions>
								},
								# more trend objects below
					},
				    # more mention counts below
    	},			
    }

`anonymized_engagement_by_topic.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    	},
    	'data':{
    					'topic_1': <# of mentions>,
				   		# more engagement topic mentions below
    	},			
    }

`anonymized_engagement_by_mentions.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    	},
    	'data':{
    					'1': [ #array of engagement topic names]
					},
				    # more mention counts below
    	},			
    }

`anonymized_drivers_by_topic.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    	},
    	'data':{
    					'driver_1': [ #array of driver objects
								{
									'name':<driver name>,
									'description:<driver description>,
									'mentions':<# mentions>
								},
								# more driver objects below
					},
				    # more mention drivers below
    	},			
    }

`anonymized_drivers_by_mentions.json`: Format as shown below.

    {
    	'metadata':{
    					'name': <name of dataset>,
						'source':<name of original source file>,
						'title':<title of the dataset>,
						'about':<info about the dataset>,
    					'filename': <name of the JSON file>
    	},
    	'data':{
    					'1': [ #array of driver objects
								{
									'name':<driver name>,
									'description:<driver description>,
									'mentions':<# mentions>
								},
								# more driver objects below
					},
				    # more mention counts below
    	},			
    }

### OASIS Viewer Datasets ###

The OASIS Viewer datasets are the output of the OASIS CSV download tool. Each file contains the flattened output (using XSLT) of the hierarchical finding aid XML tree, with one row per finding aid component (e.g. folder, box, item). Each row consists of 27 columns (or fields), separated by a comma. The column headers are shown below. For any given finding aid, some or all of these fields may be empty of data. The OASIS Timeline Viewer makes use of some, but not all, of these fields.

1. ID
1. Unit Title
1. Unit Date
1. Start Year
1. End Year
1. Unit ID	Level
1. Originator
1. Container 1
1. Container 2
1. Container 3
1. Phys. Desc. 1
1. Phys. Desc. 2
1. Phys. Desc. 3
1. Phys. Loc
1. Access Restrict.
1. URN
1. Collection Title
1. Originator
1. Collection Date
1. Collection ID
1. Parent 1
1. Parent 2
1. Parent 3
1. Parent 4
1. Parent 5
1. Parent 6
