//TODO this is only a test till now

//It has to be done with PHP in order to contain all necessary files

/*
var CACHE = 'precached';
 
self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');

  evt.waitUntil(precache());
});

 
self.addEventListener('fetch', function(evt) {
  
  evt.respondWith(fromCache(evt.request));
});

 
function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
      './',
      './index.php',
      './style.css',
      './Game.js',
      './PD.js',
      './Piece.js',
      './Evaluator.js',
      './UI.js',
      './Visual.js',
      './offline.js',
      './notices.md',
      './index.html',
      './icons/fill_center.png',
      './icons/fill_left.png',
      './icons/fill_random.png',
      './icons/fill_right.png',
      './icons/fill_horizontally.png',
      './icons/fill_vertically.png',
      './icons/noinit.png',
      './icons/redo.png',
      './icons/rotate_left.png',
      './icons/rotate_right.png',
      './icons/tidy_up.png',
      './icons/undo.png',
      './icons/vol_off.png',
      './icons/vol_on.png',
      './boards/5x12.txt',
      './boards/6x10.txt'
    ]);
  });
}

function fromCache(request) {
	
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
   
      return matching || Promise.reject('no-match');
    });
  });
}

*/