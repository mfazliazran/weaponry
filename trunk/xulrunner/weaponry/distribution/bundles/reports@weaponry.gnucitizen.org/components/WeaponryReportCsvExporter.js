/**
 *  WeaponryReportCsvExporter.js
 *  Copyright (C) 2007-2011  GNUCITIZEN
 *  
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

const CR = Components.results;
const CC = Components.classes;
const CI = Components.interfaces;

/* ------------------------------------------------------------------------ */

const CHROMEBASE = 'reports.weaponry.gnucitizen.org';

/* ------------------------------------------------------------------------ */

Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

/* ------------------------------------------------------------------------ */

function WeaponryReportCsvExporter() {
	// pass
}

WeaponryReportCsvExporter.prototype = {
	classDescription: 'Weaponry Report Csv Exporter',
	classID: Components.ID('{10da96e0-09d1-11df-8a39-0800200c9a66}'),
	contractID: '@reports.weaponry.gnucitizen.org/weaponry-report-csv-expoter;1',
	QueryInterface: XPCOMUtils.generateQI([CI.IWeaponryReportFileExporter, CI.IWeaponryReportStreamExporter, CI.IWeaponryTaskHolder]),
	
	/* -------------------------------------------------------------------- */
	
	_xpcom_categories: [
		{service:false, entry:'WeaponryReportCsvExporter', category:'weaponry-report-exporters'}
	],
	
	/* -------------------------------------------------------------------- */
	
	get wrappedJSObject () {
		return this;
	},
	
	/* -------------------------------------------------------------------- */
	
	reportFileType: 'CSV',
	reportFileExtension: 'csv',
	
	/* -------------------------------------------------------------------- */
	
	exportReportToFile: function (workspace, file, completionHandler) {
		let fileOutputStream = CC['@mozilla.org/network/file-output-stream;1'].createInstance(CI.nsIFileOutputStream);
		
		fileOutputStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
		
		this.exportReportToStream(workspace, fileOutputStream, {
			handle: function (outputStream) {
				outputStream.close();
				
				if (completionHandler) {
					completionHandler.handle();
				}
			}
		});
	},
	
	/* -------------------------------------------------------------------- */
	
	exportReportToStream: function (workspace, outputStream, completionHandler) {
		let converterOutputStream = CC['@mozilla.org/intl/converter-output-stream;1'].createInstance(CI.nsIConverterOutputStream);
		
		converterOutputStream.init(outputStream, 'UTF-8', 0, 0);
		converterOutputStream.writeString('level,title,summary\n');
		
		let self = this;
		let reportsService = CC['@reports.weaponry.gnucitizen.org/service;1'].getService(CI.IWeaponryReportsService);
		
		reportsService.issuesTable.wrappedJSObject.enumerateTableItemsAsynchronouslyFast(workspace, null,
			function (result) {
				converterOutputStream.writeString([result.level, result.title, result.summary].join(',') + '\n');
			},
			
			function () {
				if (completionHandler) {
					completionHandler.handle(outputStream);
				}
				
				if (self.task) {
					self.task.finish();
				}
			}
		);
	},
	
	/* -------------------------------------------------------------------- */
	
	getTask: function () {
		return this.task;
	},
	
	setTask: function (task) {
		this.task = task;
	},
	
	unsetTask: function (task) {
		delete this.task;
	}
};

/* ------------------------------------------------------------------------ */

if (XPCOMUtils.generateNSGetFactory) {
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([WeaponryReportCsvExporter]);
} else {
	var NSGetModule = XPCOMUtils.generateNSGetModule([WeaponryReportCsvExporter]);
}

/*  GNUCITIZEN (Information Security Think Tank)
 **********************************************/