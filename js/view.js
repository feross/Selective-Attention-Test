function rand(num) {
  return Math.floor(Math.random()*(num+1))
}

var Element = Class.$extend({ // abstract class
  __init__ : function(x, y, dx, dy, _opt) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.$e = $('<div>');
    
    if (_opt) {
      if (_opt.cls) this.$e.addClass(_opt.cls);
      if (_opt.id) this.$e.attr('id', _opt.id);
    }
    
    $(g.gameWindow).append(this.$e);
    this.draw(0);
  },
  
  /** Advance element's state one tick forward */
  update : function() {
    
    // Update the element's location based on velocity of last tick
    this.x += this.dx;
    this.y += this.dy;
  },
  
  /** Draw everything in the game world to the screen */
  draw : function(interpolation) {
    if (!interpolation) interpolation = 0;
    
    // truncated to an integer for DOM performance
    this.$e.css('left', (this.x + this.dx * interpolation) | 0);
    this.$e.css('top', (this.y + this.dy * interpolation) | 0);
  },

  /**
   * Removes an element from the screen and from the array that tracks
   * all the objects that are on-screen.
   */
  remove : function(_all) {
    if (_all) {
      var i = 0, len = _all.length;
      while (i < len) {
        if (_all[i] == this) {
          _all.splice(i, 1);
          len -= 1;
        } else {
          i += 1;
        }
      }
    }
    
    this.$e.remove();
  },
  
});
