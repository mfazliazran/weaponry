![http://weaponry.googlecode.com/svn/wiki/weaponry.png](http://weaponry.googlecode.com/svn/wiki/weaponry.png)



# Introduction #

The following page summarises the purpose and usage of some of the more popular mozilla technologies.

# Tips and Tricks #

## Getting Proper Errors from NSPR ##

```
printf("%s: %s\n", PR_ErrorToName(PR_GetError()), PR_ErrorToString(PR_GetError(), PR_LANGUAGE_I_DEFAULT));
```