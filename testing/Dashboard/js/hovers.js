/**
 * hovers.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */

window.onload = function() {
  (function() {
    function init() {
      var speed = 330,
        easing = mina.backout;
      [].slice.call ( document.querySelectorAll( '#dashboard > a' ) ).forEach( function( el ) {
        var s = Snap( el.querySelector( 'svg' ) ), path = s.select( 'path' ),
          pathConfig = {
            from : path.attr( 'd' ),
            to : el.getAttribute( 'data-path-hover' )
          };
        el.addEventListener( 'mouseenter', function() {
          path.animate( { 'path' : pathConfig.to }, speed, easing );
        });
        el.addEventListener( 'mouseleave', function() {
          path.animate( { 'path' : pathConfig.from }, speed, easing );
        });
      } );
    }
    init();
  })();
};