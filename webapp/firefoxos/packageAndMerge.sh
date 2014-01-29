# clean up working web app directory
rm -fr www/*

# copy web assets from main project's www directory
cp -va ../../www/ www/

# overwrite default web assets with any firefoxos-specific versions of those files
cp -va merges/ www/

# everything in the ./www directory is now ready to be uploaded to a hosting site
