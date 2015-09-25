![http://weaponry.googlecode.com/svn/wiki/weaponry.png](http://weaponry.googlecode.com/svn/wiki/weaponry.png)



# Introduction #

This page describes how to build xulrunner from source.

# Obtaining the Source #

Before you even start thinking about building you need to get the xulrunner/mozilla source. There are several ways you can do that. First, you can simply visit http://developer.mozilla.org/en/XULRunner and get it from there. You can also use Mercurial to get the latest development trunk.

If you plan to use Mercurial you will need the Mercurial client (i.e. `hg`) first.

  * Mercurial on Windows
> The simplest way to get Mercurial is to download and install the [Mozilla Build](http://ftp.mozilla.org/pub/mozilla.org/mozilla/libraries/win32/MozillaBuildSetup-Latest.exe), which you will need anyway if you plan to build on Windows.

  * Mercurial on Mac
> The simplest way to get Mercurial is to install the [Mac Ports](http://www.macports.org/) and get it with the port command (i.e. `sudo port install mercurial +universal`).

  * Mercurial on Linux
> Mercurial is pretty much native on Linux. Get it via whichever package manager you use (i.e. `apt-get install mercurial`).

Once you have Mercurial all you need to do is to get the latest source (i.e. `hg clone http://hg.mozilla.org/releases/mozilla-1.9.2/ mozilla-1.9.2`).

# Building on Mac OS X (Snow Leopard) #

First we need the following requirements:

  * [XCode](http://developer.apple.com/technologies/tools/xcode.html) (comes with your Mac's dvd)
  * [Mac Ports](http://www.macports.org/)

From the Mac Ports you need gmake, coreutils, libidl and autoconfg213. This is how you install them:

```
sudo port install gmake +universal
sudo port install coreutils +universal
sudo port install libidl +universal
sudo port install autoconf213 +universal
```

Put the mozilla source at a convenient place and change your working directory to it.

## Building Debug Version ##

You need to create a file called .mozconfig inside the mozilla source with the following content:

```
mk_add_options MOZ_CO_PROJECT=xulrunner
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-mac-dbg
mk_add_options MOZ_MAKE_FLAGS="-s -j4"

ac_add_options --disable-tests
ac_add_options --enable-logging
ac_add_options --enable-debug
ac_add_options --disable-optimize
ac_add_options --disable-crashreporter
ac_add_options --disable-installer
ac_add_options --enable-application=xulrunner
ac_add_options --with-macos-sdk=/Developer/SDKs/MacOSX10.5.sdk
ac_add_options --target=i386-apple-darwin8.0.0
ac_add_options --enable-macos-target=10.5
#ac_add_options --enable-jemalloc

#CC="gcc-4.0 -arch i386"
#CXX="g++-4.0 -arch i386"
CC="gcc-4.2 -arch i386"
CXX="g++-4.2 -arch i386"

#HOST_CC="gcc-4.0"
#HOST_CXX="g++-4.0"
HOST_CC="gcc-4.2"
HOST_CXX="g++-4.2"

RANLIB=ranlib
AR=ar
AS=$CC
LD=ld
STRIP="strip -x -S"
CROSS_COMPILE=1
```

Start the build process by executing `make -f client.mk build`

Once the build is finished check `obj-xul-mac-dbg/dist/XUL.framework` for the XUL.framework.

## Building Release Version ##

Nothing changes except the .mozconfig file which should look something similar to the following:

```
mk_add_options MOZ_CO_PROJECT=xulrunner
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-mac-res
mk_add_options MOZ_MAKE_FLAGS="-s -j4"

ac_add_options --disable-tests
#ac_add_options --enable-logging
#ac_add_options --enable-debug
#ac_add_options --disable-optimize
ac_add_options --disable-crashreporter
ac_add_options --disable-installer
ac_add_options --enable-application=xulrunner
ac_add_options --with-macos-sdk=/Developer/SDKs/MacOSX10.5.sdk
ac_add_options --target=i386-apple-darwin8.0.0
ac_add_options --enable-macos-target=10.5
#ac_add_options --enable-jemalloc

#CC="gcc-4.0 -arch i386"
#CXX="g++-4.0 -arch i386"
CC="gcc-4.2 -arch i386"
CXX="g++-4.2 -arch i386"

#HOST_CC="gcc-4.0"
#HOST_CXX="g++-4.0"
HOST_CC="gcc-4.2"
HOST_CXX="g++-4.2"

RANLIB=ranlib
AR=ar
AS=$CC
LD=ld
STRIP="strip -x -S"
CROSS_COMPILE=1
```

The only main change is that the following tree lines are disabled:

```
#ac_add_options --enable-logging
#ac_add_options --enable-debug
#ac_add_options --disable-optimize
```

## Building With Symbols ##

To build with symbols you need the following options in your mozconfig:

```
 export MOZ_DEBUG_SYMBOLS=1 
 export CFLAGS="-gdwarf-2"
 export CXXFLAGS="-gdwarf-2"
```

# Building on Windows (XP) #

First we need the following requirements:

  * [Microsoft Visual Studio 2008](http://www.microsoft.com/express/Downloads/#2008-Visual-CPP)
  * [Microsoft Windows 7 SDK](http://www.microsoft.com/downloads/details.aspx?FamilyID=c17ba869-9671-4330-a63e-1fd44e0e2505&displaylang=en)
  * [Microsoft  Windows 2003 SDK](http://www.microsoft.com/downloads/details.aspx?familyid=a55b6b43-e24f-4ea3-a93e-40c0ec4f68e5&displaylang=en)
  * [Mozilla Build](http://ftp.mozilla.org/pub/mozilla.org/mozilla/libraries/win32/MozillaBuildSetup-Latest.exe)
  * [Java Development Kit](http://java.sun.com/javase/downloads/widget/jdk6.jsp)

Install all dependencies using the settings that come by default.

MozillaBuildSetup-Latest.exe, is slightly broken. You need to remove `c:\mozilla-build\vim\vim72\install.exe` to make it work correctly.

Fire up the build environment by simply opening cmd.exe, going to `c:\mozilla-build\` and executing any of the following scripts depending on which version of Visual Studio you have: start-msvc6.bat, start-msvc71.bat, start-msvc8.bat or start-msvc9.bat. If you use VS 2008 Express you need start-msvc9.bat.

## Building Debug Version ##

As usual, you need to create a file called .mozconfig inside the mozilla source with the following content:

```
mk_add_options MOZ_CO_PROJECT=xulrunner
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-win-dbg
mk_add_options MOZ_MAKE_FLAGS="-s -j4"

ac_add_options --disable-activex
ac_add_options --disable-tests
ac_add_options --enable-logging
ac_add_options --enable-debug
ac_add_options --disable-optimize
ac_add_options --disable-crashreporter
ac_add_options --disable-installer
ac_add_options --enable-application=xulrunner
ac_add_options --enable-jemalloc
```

Notice the option:

```
ac_add_options --enable-jemalloc
```

This enables jemalloc which in theory should be better allocator than the default one. However, if for some reason your build fails and you want to disable this option you need to do a few more things. Before you start the building process you need to setup WIN32\_REDIST\_DIR environment variable, which holds the path to the VC redistributable runtime. You need this in order for the build process to automatically copy the files that are required to satisfy the VC dependencies. This is how we do it:

```
export WIN32_REDIST_DIR="$VCINSTALLDIR\\redist\\x86\\Microsoft.VC90.CRT"
```

Keep in mind that the example above is for VC9. If you use other version of Visual C, you need to change the path accordingly.

As a reminder, the above is only required if you want to use the default allocator but not jemalloc!

You may also need to setup the path to JDK (i.e. JAVA\_HOME). This is how you can do this:

```
 export JAVA_HOME=/c/Program\ Files/Java/jdk1.6.0_20/
```

It is important to provide the correct path as this is just an example.

Start the build process by running: `make -f client.mk build`

Once the build is finished check `obj-xul-win-dbg/dist/bin` for xulrunner.

## Building Release Version ##

Nothing changes except the .mozconfig file which should look something similar to the following:

```
mk_add_options MOZ_CO_PROJECT=xulrunner
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-win-res
mk_add_options MOZ_MAKE_FLAGS="-s -j4"

ac_add_options --disable-activex
ac_add_options --disable-tests
#ac_add_options --enable-logging
#ac_add_options --enable-debug
#ac_add_options --disable-optimize
ac_add_options --disable-crashreporter
ac_add_options --disable-installer
ac_add_options --enable-application=xulrunner
ac_add_options --enable-jemalloc
```

The only main change is that the following tree lines are disabled:

```
#ac_add_options --enable-logging
#ac_add_options --enable-debug
#ac_add_options --disable-optimize
```

## Building With Symbols ##

To build with symbols you need the following options in your mozconfig:

```
export MOZ_DEBUG_SYMBOLS=1
ac_add_options --enable-debugger-info-modules=yes
```

# Building on Linux (Ubuntu) #

Building xulrunner for linux is often extremely easy. There are a number of dependencies but in general you need:

  * libidl
  * Java, Python, Perl and couple of other tools
  * the linux essential build utils such as make, gcc, autoconfg, etc.

As a general rule of the thumb, just try to run a build. If the build fails you will get a message of what dependency you are missing.

## Building Debug Version ##

As usual, you need to create a file called .mozconfig inside the mozilla source with the following content:

```
mk_add_options MOZ_CO_PROJECT=xulrunner
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-lin-dbg
mk_add_options MOZ_MAKE_FLAGS="-s -j4"

ac_add_options --disable-tests
ac_add_options --enable-logging
ac_add_options --enable-debug
ac_add_options --disable-optimize
ac_add_options --disable-crashreporter
ac_add_options --disable-installer
ac_add_options --enable-application=xulrunner
ac_add_options --enable-jemalloc
```

Start the build process by running: `make -f client.mk build`

Once the build is finished check `obj-xul-lin-dbg/dist/bin` for xulrunner.

## Building Release Version ##

Nothing changes except the .mozconfig file which should look something similar to the following:

```
mk_add_options MOZ_CO_PROJECT=xulrunner
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-lin-res
mk_add_options MOZ_MAKE_FLAGS="-s -j4"

ac_add_options --disable-tests
#ac_add_options --enable-logging
#ac_add_options --enable-debug
#ac_add_options --disable-optimize
ac_add_options --disable-crashreporter
ac_add_options --disable-installer
ac_add_options --enable-application=xulrunner
ac_add_options --enable-jemalloc
```

The only main change is that the following tree lines are disabled:

```
#ac_add_options --enable-logging
#ac_add_options --enable-debug
#ac_add_options --disable-optimize
```

## Building With Symbols ##

To build with symbols you need the following options in your mozconfig:

```
 export MOZ_DEBUG_SYMBOLS=1
 export CFLAGS="-gstabs+"
 export CXXFLAGS="-gstabs+"
```

# Using Multiple Configuration Setups #

It is possible to use multiple mozconfig files to build different versions and applications from the same source tree. This is how it is done:

```
export MOZCONFIG=/path/to/mozilla/mozconfig-application
make -f client.mk build
```

Keep in mind that you may want to modify the MOZ\_OBJDIR option to point to a folder specific to each build so that they don't end up overriding each others files. For example:

```
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-lin-dbg
```

... will be the linux dbg object folder while

```
mk_add_options MOZ_OBJDIR=@TOPSRCDIR@/obj-xul-mac-res
```

... will be the mac res object folder.

# Getting Help #

If you are stuck, the best way is to get help from the mozilla community. The two most common places where you can find good technical answers are [mozilla.dev.platform](http://groups.google.com/group/mozilla.dev.platform/topics) and [mozilla.dev.builds](http://groups.google.com/group/mozilla.dev.builds/topics) newsgroups.

You can also check the [buildbot](http://hg.mozilla.org/build/buildbot-configs/file) for examples and ideas of how to build your project.

Alternatively, you can check the Mozilla Developer Center:

  * [Configuring Build Options](https://developer.mozilla.org/en/Configuring_Build_Options)
  * [Building with Debug Symbols](https://developer.mozilla.org/en/Building_Firefox_with_Debug_Symbols)

# Notes #

Although if you follow these instructions you should be able to compile xulrunner for the three main platforms, your build may still fail for unknown reasons. The best way to approach the problem is to look at the error messages and try to find a solution. Hacking the source is often not the best option. Errors are usually due to dependency or configuration problems. Try to adjust your environment until you get it right.

_Best of luck._