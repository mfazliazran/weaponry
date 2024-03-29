/**
 *  WeaponryBrowserService.js
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

function WeaponryBrowserService() {
	this.defaultContentListener = null;
}

WeaponryBrowserService.prototype = {
	classDescription: 'Weaponry Browser Service',
	classID: Components.ID('{5200cde0-040b-11df-8a39-0800200c9a66}'),
	contractID: '@browser.weaponry.gnucitizen.org/service;1',
	QueryInterface: XPCOMUtils.generateQI([CI.IWeaponryBrowserService, CI.nsIObserver]),
	
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
		// pass
	},
	
	deinitializeComponent: function (subject, topic, data) {
		// pass
	},
	
	/* -------------------------------------------------------------------- */
	
	defaultBrowserContentTypes: [
		'text/html',
		'application/vnd.mozilla.xul+xml',
		'image/svg+xml',
		'text/rdf',
		'text/xml',
		'application/xhtml+xml',
		'text/css',
		'text/plain',
		'image/gif',
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/bmp',
		'image/x-icon',
		'image/vnd.microsoft.icon',
		'application/http-index-format'
	],
	
	/* -------------------------------------------------------------------- */
	
	registerDefaultURIContentListener: function () {
		this.defaultContentListener = weaponryCommon.createInstance('@browser.weaponry.gnucitizen.org/content-dispatcher;1', 'nsIURIContentListener');
		
		weaponryCommon.uriLoader.registerContentListener(this.defaultContentListener);
	},
	
	unregisterDefaultURIContentListener: function () {
		// TODO: add code here
	},
	
	/* -------------------------------------------------------------------- */
	
	registerDefaultContentHandlers: function () {
		let contentDispatcher = CC['@browser.weaponry.gnucitizen.org/content-dispatcher;1'];
		let classID = Components.ID(contentDispatcher.number);
		let types = this.defaultBrowserContentTypes;
		let typesLength = types.length;
		
		let factory = {
			createInstance: function (outer, iid) {
				return weaponryCommon.componentManager.createInstanceByContractID('@browser.weaponry.gnucitizen.org/content-dispatcher;1', outer, iid);
			}
		};
		
		for (let i = 0; i < typesLength; i += 1) {
			let type = types[i];
			
			weaponryCommon.componentManager.registerFactory(classID, 'Weaponry Browser Content Dispatcher for ' + type, '@mozilla.org/uriloader/content-handler;1?type=' + type, factory, false);
		}
	},
	
	unregisterDefaultContentHandlers: function () {
		// TODO: add code here
	},
	
	/* -------------------------------------------------------------------- */
	
	openBrowserView: function (url) {
		return weaponryCommon.openWindow(null, 'chrome://org.gnucitizen.weaponry.browser/content/xul/browserView.xul', null, 'all,chrome,resizable', url);
	},
	
	openBrowserPerspective: function (url) {
		return weaponryCommon.openWindow(null, 'chrome://org.gnucitizen.weaponry.browser/content/xul/browserPerspective.xul', null, 'all,chrome,resizable', url);
	}
};

/* ------------------------------------------------------------------------ */

var NSGetFactory = XPCOMUtils.generateNSGetFactory([WeaponryBrowserService]);

/*  GNUCITIZEN (Information Security Think Tank)
 **********************************************/