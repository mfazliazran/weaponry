/**
 *  commonMenu.js
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

installHandler('org.gnucitizen.weaponry.common.commonMenu', {
	quit: function () {
		weaponryCommon.quitForcefully();
	},
	
	about: function () {
		weaponryCommon.openAboutBrandWindow();
	},
	
	onDOMContentLoaded: function (event) {
		if (event.target != document) {
			return;
		}
		
		let self = org.gnucitizen.weaponry.common.commonMenu;
		
		if (document.getElementById('common-commandset')) {
			bindHandler('file-menu-quit-command', 'command', self.quit);
			bindHandler('help-menu-about-command', 'command', self.about);
		}
		
		let $stringbundle = document.getElementById('mac-menu-stringbundle');
		let name = weaponryCommon.xulAppInfo.name;
		
		if (document.getElementById('file-menupopup')) {
			document.getElementById('file-menu-quit-menuitem').setAttribute('label', $stringbundle.getFormattedString('quit-label', [name]));
		}
		
		if (document.getElementById('help-menupopup')) {
			document.getElementById('help-menu-about-menuitem').setAttribute('label', $stringbundle.getFormattedString('about-label', [name]));
		}
	}
});

/*  GNUCITIZEN (Information Security Think Tank)
 **********************************************/