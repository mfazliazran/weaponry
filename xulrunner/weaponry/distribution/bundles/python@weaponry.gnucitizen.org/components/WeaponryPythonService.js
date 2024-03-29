/**
 *  WeaponryPythonService.js
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

Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');
Components.utils.import('resource://org.gnucitizen.weaponry.common/content/mod/weaponryCommon.jsm');

/* ------------------------------------------------------------------------ */

function WeaponryPythonService() {
	this.pythonInterpreter = null;
}

WeaponryPythonService.prototype = {
	classDescription: 'Weaponry Python Service',
	classID: Components.ID('{29ab8bf0-5ec9-11df-a08a-0800200c9a66}'),
	contractID: '@python.weaponry.gnucitizen.org/service;1',
	QueryInterface: XPCOMUtils.generateQI([CI.IWeaponryPythonService]),
	
	/* -------------------------------------------------------------------- */
	
	get wrappedJSObject () {
		return this;
	},
	
	/* -------------------------------------------------------------------- */
	
	findPythonInterpeter: function () {
		let os = weaponryCommon.xulAppInfo.OS;
		
		let file;
		
		if (os == 'Darwin') {
			// TODO: take into consideration PATH and PYTHONPATH environment varaibles
			file = weaponryCommon.createInstance('@mozilla.org/file/local;1', 'nsILocalFile');
			
			file.initWithPath('/usr/bin/python');
			//
		} else
		if (os == 'Linux') {
			// TODO: take into consideration PATH and PYTHONPATH environment varaibles
			file = weaponryCommon.createInstance('@mozilla.org/file/local;1', 'nsILocalFile');
			
			file.initWithPath('/usr/bin/python');
			//
		} else
		if (os == 'WINNT') {
			throw new Error('not implemented'); // TODO: add code here
		} else {
			throw new Error('cannot find python interpreter');
		}
		
		return file;
	},
	
	/* -------------------------------------------------------------------- */
	
	getPythonInterpreter: function () {
		if (this.pythonInterpreter == null) {
			this.pythonInterpreter = this.findPythonInterpeter();
		}
		
		return this.pythonInterpreter;
	},
	
	/* -------------------------------------------------------------------- */
	
	prepareArguments: function (pythonInterpreter, file, parameters) {
		// TODO: python path
		// TODO: setup proxy settings
		
		return [pythonInterpreter, file.path].concat(parameters);
	},
	
	/* -------------------------------------------------------------------- */
	
	executePythonFile: function (file, parameters) {
		weaponryCommon.executeFile.apply(weaponryCommon, this.prepareArguments(this.getPythonInterpeter(), file, parameters));
	},
	
	executePythonScript: function (script, parameters) {
		throw new Error('not implemented'); // TODO: add code here
	},
	
	/* -------------------------------------------------------------------- */
	
	launchPythonFile: function (file, parameters) {
		weaponryCommon.launchFile.apply(weaponryCommon, this.prepareArguments(this.getPythonInterpeter(), file, parameters));
	},
	
	launchPythonScript: function (script, parameters) {
		throw new Error('not implemented'); // TODO: add code here
	}
};

/* ------------------------------------------------------------------------ */

var NSGetFactory = XPCOMUtils.generateNSGetFactory([WeaponryPythonService]);

/*  GNUCITIZEN (Information Security Think Tank)
 **********************************************/