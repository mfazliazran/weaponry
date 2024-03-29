/**
 *  WeaponryReportJsonExporter.js
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

function WeaponryReportJsonExporter() {
	// pass
}

WeaponryReportJsonExporter.prototype = {
	classDescription: 'Weaponry Report Json Exporter',
	classID: Components.ID('{b787b020-2454-11df-8a39-0800200c9a66}'),
	contractID: '@reports.weaponry.gnucitizen.org/weaponry-report-json-expoter;1',
	QueryInterface: XPCOMUtils.generateQI([CI.IWeaponryReportFileExporter, CI.IWeaponryReportStreamExporter, CI.IWeaponryTaskHolder]),
	
	/* -------------------------------------------------------------------- */
	
	get wrappedJSObject () {
		return this;
	},
	
	/* -------------------------------------------------------------------- */
	
	reportFileType: 'JSON',
	reportFileExtension: 'json',
	
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
		
		let issues = [];
		let self = this;
		let reportsService = CC['@reports.weaponry.gnucitizen.org/service;1'].getService(CI.IWeaponryReportsService);
		
		reportsService.issuesTable.wrappedJSObject.enumerateTableItemsAsynchronouslyFast(workspace, null,
			function (result) {
				issues.push(result);
			},
			
			function () {
				converterOutputStream.writeString(JSON.stringify(issues));
				
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

var NSGetFactory = XPCOMUtils.generateNSGetFactory([WeaponryReportJsonExporter]);

/*  GNUCITIZEN (Information Security Think Tank)
 **********************************************/