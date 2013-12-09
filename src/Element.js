PiratesApp.Element = (function(){

	/**
	 * Element class represents single grid element, which can be one of the coins (active),
	 * empty (non-interactive, static fields) and blank (element removed after match has been found)
	 *
	 * @constructor
	 * @param {Object} config Configuration object
	 * @param {Number} config.speedX The speed at which element will be moving on X-axis
	 * @param {Number} config.speedY The speed at which element will be moving on Y-axis
	 * @param {Number} config.type Type of the element, interpreted as follows:
	 * 0 to 4 - active elements (red, blue, yellow, green, purple)
	 * 5 - blank element (right after disappearance and before refill)
	 * 6 - empty element (not clickable, not moveable)
	 * @param {Number} config.gird Parent grid of the element = Grid object which stores this element
	 * @param {Number} config.index Index of the element in grid.level array
	 * @param {Number} config.top Top position on screen
	 * @param {Number} config.left Left position on screen
	 * @param {Number} config.width Width of the element
	 * @param {Number} config.height Height of the element
	 * @param {Number} config.opacity Opacity of the element
	 * @param {Number} config.zindex Zindex of the element usefull when positioning on grid
	 * @param {String} config.fill
	 * @param {Boolean} config.capture Determines if element will capture events
	 */
	function Element(config){

		var self = this;

		this.speedX = config.speedX;
		this.speedY = config.speedY;
		this.type = config.type;
		this.index = config.index;
		this.grid = config.grid;

		// perform initialization based on config parameter
		this.shape = new Engine.Transform({
			name: 'daisy',
			top: config.top,
			left: config.left,
			children: [
				new Engine.Geometry.Rectangle({
					fill: config.fill,
					width: config.width,
					height: config.height,
					top: config.top,
					left: config.left,
					captureEvents: config.capture,
					opacity: config.opacity,
					zindex: config.type === 6 ? config.zindex + 1 : config.zindex,
					on: {
						mouseclick: function(){

							if (self.grid.ready) self.grid.performClick(self.index);

						}
					}
				}),
			]
		});

	}

	Element.property(/**@lends PiratesApp.Grid.prototype*/{

		/** The speed at which element will be moving on X-axis */
		speedX: 0,

		/** The speed at which element will be moving on Y-axis */
		speedY: 0,

		/** Specifies the type of the element (active, blank or empty) */
		type: 0,

		/** Ispecifies index of the element in array collecting or the elements */
		index: 0,

		/** Points to the grid which stores elements and handles operations */
		grid: null,

		/** Object with one rectangle kid */
		shape: null

	}),

	Element.method({
		/**
		 * Moves element in given direction
		 */
		travel: function(dx, dy){

			this.shape.translate(this.speedX * dx, this.speedY * dy);

		}
	});

	return Element;

})()
