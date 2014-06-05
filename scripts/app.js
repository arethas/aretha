var mopidy = new Mopidy({
    webSocketUrl: 'ws://192.168.0.48:6680/mopidy/ws/'
});

var consoleError = console.error.bind(console);

var PlaybackState = {
  "playing": {
    label: "Playing",
    isPlaying: true
  },
  "paused": {
    label: "Paused",
    isPlaying: false
  },
  "stopped": {
    label: "Stopped",
    isPlaying: false
  },
};

function isPlaying() {
  var defer = Q.defer();

  mopidy.playback.getState().then(function (state) {
    defer.resolve(PlaybackState[state].isPlaying);
  }, function (error) {
    defer.reject(error);
  });
  
  return defer.promise;
}

function spinnerStart(elem) {
  elem.children().remove();
  elem.append('<span class="fa fa-spinner fa-lg fa-spin"></span>');
}

function spinnerEnd(elem) {
  elem.find('.fa-spinner').remove();
}

function setPlayingClass(state) {
  if (PlaybackState[state].isPlaying) {
    $body.addClass('playing');
  } else {
    $body.removeClass('playing');
  }
};

function setStateClass(state) {
  $body.removeClass(function (index, name) { console.log(index, name); return name; }).addClass('playback-state-' + state);
  setPlayingClass(state);
};

var $body = $('body');

$body.on('playback:action', function (event, data) {
  console.log(data);

  switch (data.action) {
    case 'play': console.log('play'); mopidy.playback.play(); break;
    case 'pause': console.log('pause'); mopidy.playback.pause(); break;
    case 'stop': console.log('stop'); mopidy.playback.stop(); break;
    case 'resume': console.log('resume'); mopidy.playback.resume(); break;
    case 'next': console.log('next'); mopidy.playback.next(); break;
    case 'previous': console.log('previous'); mopidy.playback.previous(); break;
    case 'up': console.log('up'); break;
    case 'down': console.log('down'); break;
  }

});

$('[data-playback-action]').on('click', function () {
  var $this = $(this);
  console.log($this.data('playback-action'));
  $this.trigger('playback:action', {action: $this.data('playback-action')});
});

console.log(mopidy);

mopidy.on(console.log.bind(console));

mopidy.on('state:online', function () {
    console.log('ONLINE');

    mopidy.playlists.getPlaylists().then(function (response) {
    console.log(response);

    var $playlists = $('#playlists');
    var $playlist = $('#playlist');

    _.forEach(response, function (playlist) {
      var elem = $('<li>' + playlist.name + '</li>');

      elem.on('click', function () {
        spinnerStart($playlist);
        mopidy.playlists.lookup(playlist.uri).then(function (playlist) {
          spinnerEnd($playlist);
          console.log(playlist);
          _.forEach(playlist.tracks, function (track) {
            var $track = $('<li>' + track.length + 'ms - ' + track.name + ' - ' + track.artists + '</li>');

            $track.on('click', function () {
              mopidy.tracklist.add([track]);
            });

            $playlist.append($track);
          });
        }, consoleError);
      });

      $playlists.append(elem);
    });
  }, consoleError);
});


