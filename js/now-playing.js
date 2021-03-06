function dopplr(name) {
    // "we take the MD5 digest of the city’s name, convert it to
    //  hex and take the first 6 characters as a CSS RGB value."
    // http://everwas.com/2009/03/dopplr-city-colors.html
    return "#" + md5(name).substring(0, 6);
}
NowPlaying = function(api, user, interval) {
    this.api = api;
    this.user = user;
    this.lastArtist = '';
    this.lastTitle  = '';
    this.lastArtwork = '';
    this.lastFavicon = '';

    /* AutoUpdate frequency - Last.fm API rate limits at 1/sec */
    this.interval = interval || 5;
};
NowPlaying.prototype = {

    display: function(track)
    {
        if (track.artist == ' ') { // clear images
            $('#track-artwork img').hide();
            //$('body').css("background-color", "#999");
            //$('body').css("background-image", "");
            //$('#artwork').css("background-image", "");
            $("#favicon").remove();
            $('<link id="favicon" rel="shortcut icon" href="images/favicon.ico" />').appendTo('head');
        }
        else if (track.artist != this.lastArtist && track.name != this.lastTitle) {

            // Get an artist image from Last.fm
            this.api.getArtistInfo(
                track.artist,
                jQuery.proxy(this.handleResponse, this),
                function(error) { console && console.log(error); }
            );

            // Check artwork
            if (track.artwork && track.artwork.length &&
                track.artwork != this.lastArtwork) {
                //$('body').css("background-image", "url('" + track.artwork + "')");
                //$('#artwork').css("background-image", "url('" + track.artwork + "')");
                this.lastArtwork = track.artwork;
            }
            else {
                //$('body').css("background-color", dopplr(track.artist));
                //$('body').css("background-image", "");
                //$('#artwork').css("background-image", "");
            }

            // Check favicon
            if (track.favicon && track.favicon.length &&
                track.favicon != this.lastFavicon) {
                $("#favicon").remove();
                $('<link id="favicon" rel="shortcut icon" href="' + track.favicon + '" />').appendTo('head');
                this.lastFavicon = track.favicon;
                }
            else {
                $("#favicon").remove();
                $('<link id="favicon" rel="shortcut icon" href="images/favicon.ico" />').appendTo('head');
            }

            // sneaky image one-liner borrowed from TwitSpace™
            // var image = "http://ws.audioscrobbler.com/2.0/?method=artist.getimageredirect&artist=" + encodeURIComponent(track.artist) + "&api_key=5f134f063744307ee6f126ac2c480fab&size=original";
            // $('body').css("background-image", "url('" + image + "')");
        }
        if (track.artist != ' ') {
            $('#artist').html('<span class="separator">by </span> <a target="linky" href="http://last.fm/music/' + encodeURIComponent(track.artist) + '">' + track.artist + '</a>');
            $('#track').html('<a target="linky" href="' + track.url + '">' + track.name + '</a>');
            document.title = track.artist + " - " + track.name;
            }
        else {
            $('#artist').html('<span class="separator"></span> <a> Silence </a>');
            $('#track').html('<a> Silence </a>');
            document.title = "Now Playing";
            }
        if (track.artist && track.name)
            $('#lyrics').html('<a target="linky" href="http://lyrics.wikia.com/' + encodeURIComponent(track.artist) + ':' + encodeURIComponent(track.name) + '">Lyrics</a>');
        else
            $('#lyrics').html('');
        if (track.album)
            $('#album').html('| Album: <a target="linky" href="http://last.fm/music/' + encodeURIComponent(track.artist) + '/' + encodeURIComponent(track.album) + '">' + track.album + '</a>');
        else
            $('#album').html('');
        if (track.artist != ' ') {
            this.lastArtist = track.artist;
            this.lastTitle  = track.name;
        }
        this.updateHeader(track);
    },

    display_artist_image: function(image)
    {
        //$('body').css("background-image", "url('" + image.image + "')");
        //this.lastArtwork = image.image;
    },

    update: function()
    {
        this.api.getNowPlayingTrack(
            this.user,
            jQuery.proxy(this.handleResponse, this),
            function(error) { console && console.log(error); }
        );
    },

    autoUpdate: function()
    {
        // Do an immediate update, don't wait an interval period
        this.update();

        // Try and avoid repainting the screen when the track hasn't changed
        setInterval(jQuery.proxy(this.update, this), this.interval * 1000);
    },

    handleResponse: function(response)
    {
        if (response) {
            if (response.artist) {
                var nowplaying = response['@attr'] && response['@attr'].nowplaying;
                this.display({
                    // The API response can vary depending on the user, so be defensive
                    artist: response.artist['#text'] || response.artist.name,
                    name: response.name,
                    favicon: response.image[0]['#text'] || null,
                    artwork: response.image[3]['#text'] || null,
                    nowplaying: nowplaying,
                    url: response.url,
                    album: response.album['#text'] || null
                });
            } else {
                // This'll be the artist image
                this.display_artist_image({
                    image: response
                });

            }
        }
        else {
            this.display({artist: ' ', name: ''});
        }
    },

    updateHeader: function(track)
    {
        if (track.nowplaying)
            var status = 'Now playing';
        else
            var status = 'Last played';
        var head = status + ":";
        $('.header').html(head);
    }
};
