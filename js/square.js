var Square = Element.$extend({
  __classvars__ : {
    removeMargin : 40,
  },
  
  __init__ : function(x, y, cls) {
    this.$super(x, y, 0, 0, {cls: cls});
    
  },
  
  update : function() {
    // this.$super();
  },

  setNewLocations : function() {
    this.x = rand(Game.width + 300) - 300;
    this.y = rand(Game.height - 200) + 200 - 40;
  },

  startAnimate : function() {
    var that = this;
    var animate = function() {
      that.setNewLocations();

      that.$e.animate({left: that.x, top: that.y}, 2000, 'linear', function() {
        // If Square goes off-screen, remove it.
        if (that.x < 0 - Square.removeMargin ||
            that.x > Game.width + Square.removeMargin ||
            that.y < 0 - Square.removeMargin ||
            that.y > Game.height + Square.removeMargin) {
          that.$e.remove();
        } else {
          animate();
        }
      });
    };
    animate();
  }
  
});


var RedSquare = Square.$extend({

  __init__ : function(x, y, cls) {
    this.$super(x, y, 'redsquare');
  },

  setNewLocations : function() {
    this.x = rand(Game.width + 300);
    this.y = rand(Game.height - 200);
  }
});