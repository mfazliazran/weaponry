/**
 *  WeaponryCommonService.js
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

/* ------------------------------------------------------------------------ */

function WeaponryCommonService() {
	// pass
}

WeaponryCommonService.prototype = {
	classDescription: 'Weaponry Common Service',
	classID: Components.ID('{3041d510-84fc-11df-8395-0800200c9a66}'),
	contractID: '@common.weaponry.gnucitizen.org/service;1',
	QueryInterface: XPCOMUtils.generateQI([CI.IWeaponryCommonService, CI.nsIObserver]),
	
	/* -------------------------------------------------------------------- */
	
	get wrappedJSObject () {
		return this;
	},
	
	/* -------------------------------------------------------------------- */
	
	observe: function (subject, topic, data) {
		if (topic == 'profile-after-change') {
			this.initializeComponent(subject, topic, data);
		} else
		if (topic == 'profile-before-change') {
			this.deinitializeComponent(subject, topic, data);
		}
	},
	
	/* -------------------------------------------------------------------- */
	
	initializeComponent: function (subject, topic, data) {
		this.registerPreferencesSchemeViewers();
		this.registerPreferencesContentConverters();
	},
	
	deinitializeComponent: function (subject, topic, data) {
		// pass
	},
	
	/* -------------------------------------------------------------------- */
	
	registerPreferencesSchemeViewers: function () {
		let prefService = CC['@mozilla.org/preferences-service;1'].getService(CI.nsIPrefService);
		let schemeViewersItems = prefService.getBranch('org.gnucitizen.weaponry.common.schemeViewers');
		let schemeViewers = {};
		
		schemeViewersItems.getChildList('', {}).forEach(function (item) {
			let tokens = item.split('.');
			
			if (tokens.length != 3) {
				Components.utils.reportError('unrecognized scheme viewer entry ' + item);
				
				return;
			}
			
			let id = tokens[1];
			let name = tokens[2];
			
			let value;
			
			if (name == 'scheme') {
				value = schemeViewersItems.getCharPref(item);
			} else
			if (name == 'uri') {
				value = schemeViewersItems.getCharPref(item);
			} else
			if (name == 'wrap') {
				value = schemeViewersItems.getBoolPref(item);
			} else {
				Components.utils.reportError('unrecognized scheme viewer entry name ' + item);
				
				return;
			}
			
			if (!schemeViewers[id]) {
				schemeViewers[id] = {};
			}
			
			schemeViewers[id][name] = value;
		});
		
		let id;
		let schemeViewer;
		
		for (id in schemeViewers) {
			schemeViewer = schemeViewers[id];
			
			this.registerSchemeViewer(schemeViewer.scheme, schemeViewer.uri, schemeViewer.wrap);
		}
	},
	
	/* -------------------------------------------------------------------- */
	
	registerPreferencesContentConverters: function () {
		let prefService = CC['@mozilla.org/preferences-service;1'].getService(CI.nsIPrefService);
		let contentConvertersItems = prefService.getBranch('org.gnucitizen.weaponry.common.contentConverters');
		let contentConverters = {};
		
		contentConvertersItems.getChildList('', {}).forEach(function (item) {
			let tokens = item.split('.');
			
			if (tokens.length != 3) {
				Components.utils.reportError('unrecognized content converter entry ' + item);
				
				return;
			}
			
			let id = tokens[1];
			let name = tokens[2];
			
			let value;
			
			if (name == 'mimeType') {
				value = contentConvertersItems.getCharPref(item);
			} else
			if (name == 'uri') {
				value = contentConvertersItems.getCharPref(item);
			} else {
				Components.utils.reportError('unrecognized content converter entry name ' + item);
				
				return;
			}
			
			if (!contentConverters[id]) {
				contentConverters[id] = {};
			}
			
			contentConverters[id][name] = value;
		});
		
		let id;
		let contentConverter;
		
		for (id in contentConverters) {
			contentConverter = contentConverters[id];
			
			this.registerContentConverter(contentConverter.mimeType, contentConverter.uri);
		}
	},
	
	/* -------------------------------------------------------------------- */
	
	registerSchemeViewer: function (scheme, uri, wrap) {
		let componentManager = Components.manager.QueryInterface(CI.nsIComponentRegistrar);
		let schemeViewer = CC['@common.weaponry.gnucitizen.org/scheme-viewer;1'];
		let classID = Components.ID(schemeViewer.number);
		
		let factory = {
			QueryInterface: XPCOMUtils.generateQI([CI.nsIFactory]),
			
			createInstance: function (outer, iid) {
				let instance = componentManager.createInstanceByContractID('@common.weaponry.gnucitizen.org/scheme-viewer;1', outer, iid);
				
				instance.QueryInterface(CI.IWeaponrySchemeViewer);
				instance.init(scheme, uri, wrap);
				
				return instance;
			},
			
			lockFactory: function (lock) {
				throw new Error('not implemented'); // TODO: implement it
			}
		};
		
		// TODO: classID needs to be unique in order for this to work in xulrunner 2.0 >
		componentManager.registerFactory(classID, 'Weaponry Scheme Viewer for ' + scheme, '@mozilla.org/network/protocol;1?name=' + scheme, factory);
		//
	},
	
	unregisterSchemeViewer: function (scheme, uri) {
		// NOTE: not implemented
	},
	
	/* -------------------------------------------------------------------- */
	
	registerContentViewer: function (mimeType, uri) {
		let componentManager = Components.manager.QueryInterface(CI.nsIComponentRegistrar);
		let contentConverter = CC['@common.weaponry.gnucitizen.org/content-converter;1'];
		let classID = Components.ID(contentConverter.number);
		
		let factory = {
			QueryInterface: XPCOMUtils.generateQI([CI.nsIFactory]),
			
			createInstance: function (outer, iid) {
				let instance = componentManager.createInstanceByContractID('@common.weaponry.gnucitizen.org/content-converter;1', outer, iid);
				
				instance.QueryInterface(CI.IWeaponryContentConverter);
				instance.initWithUri(uri);
				
				return instance;
			},
			
			lockFactory: function (lock) {
				throw new Error('not implemented'); // TODO: implement it
			}
		};
		
		// TODO: classID needs to be unique in order for this to work in xulrunner 2.0 >
		componentManager.registerFactory(classID, 'Weaponry Content Converter for ' + mimeType, '@mozilla.org/streamconv;1?from=' + mimeType + '&to=*/*', factory);
		//
	},
	
	unregisterContentViewer: function (mimeType, uri) {
		// NOTE: not implemented
	}
};

/* ------------------------------------------------------------------------ */

var NSGetFactory = XPCOMUtils.generateNSGetFactory([WeaponryCommonService]);

/*  GNUCITIZEN (Information Security Think Tank)
 **********************************************/