var g, stats;

$(function() {
  g = Game('#window');
  $('#start').click(function() {
    g.start();
  });
  $('#again').click(function() {
    window.location.reload();
  });
});

var Game = Class.$extend({
  __classvars__ : {
    width : 1000,
    height : 800,
    fps: 60, // gameplay fps
    showStats : false,
  },
  
  __init__ : function(gameWindow) {
    this.gameWindow = gameWindow;
    
    if (Game.showStats) {
      this.gameStats = MyStats(); // game state fps
      this.drawStats = MyStats(); // draw fps
    }
    
    $(this.gameWindow)
      .width(Game.width)
      .height(Game.height);
    
  },
  
  // Start the game
  start : function() {
    $('#start').hide();
    $(this.gameWindow).show();

    var self = this;

    var showDino = false;
    var verticalOffset = rand(1)*600;
    $('#bg1').css({backgroundPosition: '-200px '+verticalOffset+'px'});
    $('#bg2').css({backgroundPosition: '-200px '+verticalOffset+'px', display: 'none'});

    var num1 = -100;
    var bg1 = $('#bg1').get(0);
    var animateBG = function() {
      if (num1 == 1100) {
        verticalOffset = rand(1)*600;
        $('#bg1, #bg2').css({backgroundPosition: '-200px '+verticalOffset+'px', display: showDino ? 'block' : 'none'});
        num1 = -100;
      }

      $('#bg1, #bg2').animate({backgroundPosition: num1+'px '+verticalOffset+'px'}, 500, 'linear', function() {
        if (this == bg1) {
          animateBG();
        }
      });
      
      num1 += 100;
    };
    animateBG();

    var num2 = 0;
    var timeout = function() {
      (new Square(Game.width, rand(Game.height - 400) + 200, 'square')).startAnimate();
      
      if (num2 % 2 == 0) {
        (new RedSquare(-40, rand(Game.height - 400) + 200)).startAnimate();
      }

      num2 += 1;

      if (num2 == 5) {
        showDino = true;
      }

      if (num2 < 40) {
        setTimeout(timeout, 300+rand(700));
      } else {
        console.log('else');
        setTimeout(function() {
          console.log('timeout');
          $(self.gameWindow + ', #prompt').fadeOut(function() {
            $('#final1').fadeIn(function() {
              setTimeout(function() {
                $('#final2').fadeIn(function() {
                  setTimeout(function() {
                    $('#again').fadeIn();
                  }, 2000);
                });
              }, 2000);
            });
          });
          
        }, 6000);
      }
    };
    setTimeout(timeout, 2000);

    this.keyboard = Keyboard();
    
    var run = (function() {
      var loops, now, delta,
          skipTicks = 1000 / Game.fps,
          maxFrameSkip = 10,
          nextGameTick = (new Date).getTime(),
          requestAnimFrame = window.requestAnimFrame,
          element = this.gameWindow;
    
      // Main game loop
      return function loop() {
        loops = 0;
        now = window.mozAnimationStartTime || (new Date).getTime();
        
        while (now > nextGameTick) { // it's time for a game update
          if (loops > maxFrameSkip) {
            // Skip game tick -- BAD!
            // Should only happen on slow CPUs.
            break;
          }
          self.update();
          nextGameTick += skipTicks;
          loops += 1;
        }
        
        // only draw if delta is low, otherwise we were probably
        // focused on another tab.
        delta = now - nextGameTick - skipTicks;
        if (delta < 160) {
          self.draw(1 - ((nextGameTick - now) / skipTicks));
        } else {
          // TODO: maybe pause the game, too
        }
        
        requestAnimFrame(loop, element);
      };
    })();
    
    run();
    
    // window.setInterval(function() {
    //    self.update();
    //    self.draw(0);
    //  }, 16);
  },
  
  /**
   * Update the game state by one tick. (We update at 50fps.)
   *
   * We advance the state of the game world at a constant rate, so that weird
   * performance glitches won't affect the gameplay.
   */
  update : function() {
    // _.map(Square.all, function(p) { p.update(); });

    // If stats are enabled, update the game fps.
    this.gameStats && this.gameStats.update();
  },
   
  /**
   * Draw a game frame. (We draw at 60fps.)
   *
   * This uses requestAnimationFrame, which draws at the speed of the monitor
   * refresh rate (usually 60Hz) but falls back to setTimeout at 60fps in old
   * browsers. Since the time delta between draws will be slower or faster
   * than the 30fps constant speed that we update the game state, we use
   * interpolation to draw between game state 'ticks'. We calculate a factor
   * that represents how far between frames we currently are. For example,
   * a factor of 1.0 means that we're drawing immediately after a game update,
   * and a factor of 0.5 means that we're halfway between two frames.
   */
  draw : function(interpolation) {
    _.map(Square.all, function(p) { p.draw(interpolation); });
    
    // If stats are enabled, update the draw fps.
    this.drawStats && this.drawStats.update();
  },
    
});

var Keyboard = Class.$extend({
  __init__ : function() {
    var self = this;
    
    $(window).keydown(function(e) {
      self.handleKeyDownUp(e, true);
    });
    
    $(window).keyup(function(e) {
      self.handleKeyDownUp(e, false);
    });
  },
  
  handleKeyDownUp : function(e, isDown) {
    var key = e.keyCode;
    // console.log(key);
    
    if (key == 37) { // LEFT
      this.left = isDown;
    } else if (key == 38) { // UP
      this.up = isDown;
    } else if (key == 39) { // RIGHT
      this.right = isDown;
    } else if (key == 40) { // DOWN
      this.down = isDown;
    } else if (key == 32 || key == 90) { // SPACE, Z
      this.shoot = isDown;
    } else if (key == 68 && !isDown) { // D
      $('html').toggleClass('debug');
    } else {
      return;
    }
    e.preventDefault();
  },
  
});

/**
 * requestAnimationFrame shim layer with setTimeout fallback
 * from: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame       ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame    ||
         window.oRequestAnimationFrame      ||
         window.msRequestAnimationFrame     ||
         function(callback, element) {
           window.setTimeout(callback, 1000 / 60);
         };
})();


var MyStats = Class.$extend({
  __classvars__ : {
    instances : 0
  },
  
  __init__ : function() {
    this.stats = new Stats();

    // Align top-left
    $(this.stats.domElement).css({
      left: 0,
      position: 'absolute',
      top: (MyStats.instances * 45)
    });
    
    $('body').append($(this.stats.domElement));
    
    MyStats.instances += 1;
  },
  
  update : function() {
    return this.stats.update();
  }
});

