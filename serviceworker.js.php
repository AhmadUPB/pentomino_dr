<?php

/* #################################################################

     Pentomino Digital
     
     DDI Paderborn, 2020-2022
     
     Realisation: Felix Winkelnkemper,
                  felix.winkelnkemper@uni-paderborn.de
                  
     Published under the European Union Public License
     
     https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
     
     This project uses material from other sources.
     See acknowledgements.md for details.
     
   #################################################################

*/

// This is the serviceworker for chache control for the progressive web app
// uses stale-while-revalidate strategy (whill be serverd from cache and then fetched from network)

header('Content-type: text/javascript');

?>/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
	'boards/a_5x12.txt',
	'boards/a_6x10.txt',
	'boards/a_ant.txt',
	'boards/a_butterfly.txt',
	'boards/a_canguru.txt',
	'boards/a_cat.txt',
	'boards/a_crab.txt',
	'boards/a_crocodile.txt',
	'boards/a_deer.txt',
	'boards/a_dino.txt',
	'boards/a_duck.txt',
	'boards/a_elephant.txt',
	'boards/a_face.txt',
	'boards/a_fish.txt',
	'boards/a_frog.txt',
	'boards/a_house.txt',
	'boards/a_penguin.txt',
	'boards/a_pyramid.txt',
	'boards/a_turtle.txt',
	'boards/a_umbrella.txt',
	'boards/a_yingyang.txt',
	'boards/b_3x10.txt',
	'boards/b_3x15.txt',
	'boards/b_3x20.txt',
	'boards/b_3x21.txt',
	'boards/b_3x21b.txt',
	'boards/b_3x21c.txt',
	'boards/b_3x21d.txt',
	'boards/b_4x10.txt',
	'boards/b_4x15.txt',
	'boards/b_4x16a.txt',
	'boards/b_4x16b.txt',
	'boards/b_4x16c.txt',
	'boards/b_4x16d.txt',
	'boards/b_4x16e.txt',
	'boards/b_4x16g.txt',
	'boards/b_4x16h.txt',
	'boards/b_4x16i.txt',
	'boards/b_4x16k.txt',
	'boards/b_5x10.txt',
	'boards/b_5x11.txt',
	'boards/b_5x3.txt',
	'boards/b_5x4.txt',
	'boards/b_5x5.txt',
	'boards/b_5x6.txt',
	'boards/b_5x7.txt',
	'boards/b_5x8.txt',
	'boards/b_5x9.txt',
	'boards/b_8x8a.txt',
	'boards/b_8x8b.txt',
	'boards/b_8x8c.txt',
	'boards/b_8x8d.txt',
	'boards/b_8x8e.txt',
	'boards/b_8x8z.txt',
	'boards/b_circle.txt',
	'boards/b_cross.txt',
	'boards/b_holey_oval.txt',
	'boards/b_triangle.txt',
	'boards/c_F.txt',
	'boards/c_I.txt',
	'boards/c_L.txt',
	'boards/c_N.txt',
	'boards/c_P.txt',
	'boards/c_T.txt',
	'boards/c_U.txt',
	'boards/c_V.txt',
	'boards/c_W.txt',
	'boards/c_X.txt',
	'boards/c_Y.txt',
	'boards/c_Z.txt',
	'boards/collection.txt',
	'boards/d_0.txt',
	'boards/d_1.txt',
	'boards/d_2.txt',
	'boards/d_3.txt',
	'boards/d_4.txt',
	'boards/d_5.txt',
	'boards/d_6.txt',
	'boards/d_7.txt',
	'boards/d_8.txt',
	'boards/d_9.txt',
	'boards/d_a.txt',
	'boards/d_b.txt',
	'boards/d_c.txt',
	'boards/d_d.txt',
	'boards/d_e.txt',
	'boards/d_f.txt',
	'boards/d_g.txt',
	'boards/d_h.txt',
	'boards/d_i.txt',
	'boards/d_j.txt',
	'boards/d_k.txt',
	'boards/d_l.txt',
	'boards/d_m.txt',
	'boards/d_n.txt',
	'boards/d_o.txt',
	'boards/d_p.txt',
	'boards/d_q.txt',
	'boards/d_r.txt',
	'boards/d_s.txt',
	'boards/d_t.txt',
	'boards/d_u.txt',
	'boards/d_v.txt',
	'boards/d_w.txt',
	'boards/d_x.txt',
	'boards/d_y.txt',
	'boards/d_z.txt'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});


// stale-while-revalidate from https://jakearchibald.com/2014/offline-cookbook/#stale-while-revalidate

self.addEventListener('fetch', (event) => {
  event.respondWith(async function() {
    const cache = await caches.open('mysite-dynamic');
    const cachedResponse = await cache.match(event.request);
    const networkResponsePromise = fetch(event.request);

    event.waitUntil(async function() {
      const networkResponse = await networkResponsePromise;
      await cache.put(event.request, networkResponse.clone());
    }());

    // Returned the cached response if we have one, otherwise return the network response.
    return cachedResponse || networkResponsePromise;
  }());
});