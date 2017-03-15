# mkv-torrenter-and-converter
A tool to automate the process of downloading a .mkv torrent (via magnet uri), burning in subtitles, and converting to .mp4.

Installation
------------
Download [aria2c](https://aria2.github.io/), place it in "C:/" (or configure in config.js).

    npm install
    npm start (or node app.js)

Usage
------------
Enter a magnet URI to download the torrent, then convert. Leave the URI blank to convert the first mkv file in /temp. Outputs .mp4 in /output. 
