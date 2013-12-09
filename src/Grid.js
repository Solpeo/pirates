PiratesApp.Grid = (function(EngineRect, EngineParticles, getFloor, randomize){

	/**
	 * Grid class represents the whole grid on which game happens. It stores elements and
	 * performs all calculations (like finding a match) and operations (like animations) on them.
	 *
	 * @constructor
	 * @param {Number} type Determines what kind of grid will be generated: with or without empty fields
	 */
	function Grid(type){

		this.state = this.STATE_GAME;
		this.ready = false;
		this.backToIntro = false;

		this.type = type;

		this.level = new Array();
		this.toDrop = new Array();

		this.refiller = new Array();
		this.toDropRefiller = new Array(this.GRID_BREAK);

		this.blankInColumn = new Array(this.GRID_BREAK);
		this.emptyInColumn = new Array(this.GRID_BREAK);

		this.occupied = new Array(this.GRID_SIZE);
		this.positions = new Array();

		this.particles = new Array();

		this.firstPick = -1;
		this.secondPick = -1;

		this.swap = {
			direction: 0,
			currDistance: 0,
			iteration: 0
		}

		this.animate = {
			swap: false,
			drop: false,
			dropRefiller: false,
			counter: false,
			ending: false,
		}

		this.images = new Array();
		this.pickers = new Array();
		this.buttons = new Array();

		this.fullscreen = false;
		this.vPort = null;

		init(this, type);

	}

	/**
	* Initializes Grid object
	* @param {Object} self Points to the grid
	* @param {Number} type What type of grid to generate.
	*/
	var init = function(self, type){

		self.type = type === undefined ? 0 : type;

		self.countDrops = 0;

		// tempLevel is used to generate main grid and stores values generated
		// by generateGrid() function, which is complex
		var tempLevel = self.generateGrid(type);

		// tempRefiller is used to generate refiller grid and stores values generated
		// by simpler function generateSimpleGrid(). This helps to increase performance.
		var tempRefiller = self.generateSimpleGrid();

		var tempElem = {
			speedX: Grid.SPEED_X,
			speedY: Grid.SPEED_Y,
			grid: self,
			width: Grid.WIDTH,
			height: Grid.HEIGHT,
			left: Grid.START_X,
			top: Grid.START_Y,
			opacity: 0,
			capture: true
		}

		var tempElemRef = Object.clone(tempElem);
		tempElemRef.top = Grid.START_Y;
		tempElemRef.opacity = 0;
		tempElemRef.capture = false;

		var row = 0;
		for (var i = 0; i < Grid.GRID_SIZE; i++) {

			// next row, so need to change Y (move down) and X (back to starting pos on X-acis) coordinates
			if (i % Grid.GRID_BREAK === 0) {

				row++;
				tempElem.left = tempElemRef.left = Grid.START_X;
				tempElem.top = getFloor( Grid.START_Y + row * Grid.OFFSET_Y );
				tempElemRef.top = getFloor( Grid.START_Y - (row - 1) * Grid.OFFSET_Y );

				// position correction
				if (row > Grid.ROW_CORRECTION && Grid.ROW_CORRECTION !== -1) {

					tempElem.top--;
					tempElemRef.top++;

				}

			}

			// prepare elements to be pushed into 'level' array
			tempElem.type = tempLevel[i];
			tempElemRef.type = tempRefiller[i];

			self.setArgFill(tempElem);
			self.setArgFill(tempElemRef);

			tempElem.index = i;
			tempElemRef.index = -1;

			tempElem.zindex = tempElemRef.zindex = Grid.ZID_ELEM;
			if (tempLevel[i] === Grid.TYPE_EMPTY) tempElem.zindex = Grid.ZID_ELEM + 1;

			tempElem.left = tempElemRef.left += Grid.OFFSET_X;

			// position correction
			if (i % Grid.GRID_BREAK > Grid.COL_CORRECTION && Grid.COL_CORRECTION !== -1) {

				tempElem.left--;
				tempElemRef.left--;

			}

			self.positions.push({x: tempElem.left, y: tempElem.top});

			self.refiller.push(new PiratesApp.Element(tempElemRef));
			self.level.push(new PiratesApp.Element(tempElem));

		}

		for (i = 0; i < Grid.GRID_BREAK; i++) self.toDropRefiller[i] = {};

		// pickers
		self.pickers.push(
			new EngineRect({
				fill: PiratesApp.IMG_OVER,
				width: Grid.WIDTH,
				height: Grid.HEIGHT,
				top: 0,
				left: 0,
				opacity: 0,
				zindex: Grid.ZID_ELEM + 1,
				captureEvents: false,
				on: {
					mouseclick: function(){

						self.firstPick = -1;
						self.secondPick = -1;
						this.setOpacity(0);
						this.captureEvents = false;

					}
				}
			}),

			new EngineRect({
				fill: PiratesApp.IMG_OVER,
				width: Grid.WIDTH,
				height: Grid.HEIGHT,
				top: 0,
				left: 0,
				opacity: 0,
				zindex: Grid.ZID_ELEM + 1,
				captureEvents: false
			})
		);

		self.images.push(
			// background image
			new EngineRect({
				fill: PiratesApp.IMG_BG,
				width: 800,
				height: 630,
				top: -315,
				left: -400,
				captureEvents: false,
				opacity: 1,
				zindex: Grid.ZID_BG
			}),

			// score bar image
			new EngineRect({
				fill: PiratesApp.IMG_SCORE,
				width: 172,
				height: 63,
				top: -275,
				left: -210,
				captureEvents: false,
				opacity: 1,
				zindex: Grid.ZID_BG
			})
		);

		// bottom of the screen buttons
		self.buttons.push(
			new EngineRect({
				fill: PiratesApp.IMG_SOUND,
				width: 37,
				height: 36,
				top: Grid.BUTTON_Y,
				left: Grid.BUTTON_X,
				captureEvents: true,
				opacity: 1,
				zindex: Grid.ZID_BG + 2,
				on: {
					mouseclick: function(){

						PiratesApp.Sound.toggleSound();

					}
				}
			}),

			new EngineRect({
				fill: PiratesApp.IMG_MUSIC,
				width: 37,
				height: 36,
				top: Grid.BUTTON_Y,
				left: Grid.BUTTON_X + Grid.BUTTON_OFFSET,
				captureEvents: true,
				opacity: 1,
				zindex: Grid.ZID_BG + 2,
				on: {
					mouseclick: function(){

						PiratesApp.Sound.toggleMusic();

					}
				}
			}),

			new EngineRect({
				fill: PiratesApp.IMG_FULL,
				width: 37,
				height: 36,
				top: Grid.BUTTON_Y,
				left: Grid.BUTTON_X + 2 * Grid.BUTTON_OFFSET,
				captureEvents: true,
				opacity: 1,
				zindex: Grid.ZID_BG + 2,
				on: {
					mouseclick: function(){

						if (self.vPort === null) return;

						self.fullscreen = !self.fullscreen;

						if (self.fullscreen) Engine.Device.Fullscreen.request(self.vPort, Engine.NOP, Engine.NOP);
						else Engine.Device.Fullscreen.exit(self.vPort, Engine.NOP, Engine.NOP);

					}
				}
			})
		);

	}

	/** Constants: size and positions */
	/** @constant {Number} GRID_SIZE - total number of grid elements */
	Grid.GRID_SIZE = 64;

	/** @constant {Number} GRID_BREAK - number of columns */
	Grid.GRID_BREAK = 8;

	/** @constant {Number} GRID_ROWS - number of rows */
	Grid.GRID_ROWS = 8;

	/** @constant {Number} START_X - starting position on X-axis for elements */
	Grid.START_X = -280;

	/** @constant {Number} START_Y - starting position on Y-axis for elements */
	Grid.START_Y = -194;

	/** @constant {Number} OFFSET_X - distance between elements on X-axis */
	Grid.OFFSET_X = 56;

	/** @constant {Number} OFFSET_Y - distance between elements on Y-acis */
	Grid.OFFSET_Y = 56;

	/** @constant {Number} WIDTH - width of the element */
	Grid.WIDTH = 53;

	/** @constant {Number} HEIGHT - height of the element */
	Grid.HEIGHT = 53;

	/**
	 * Next two constants are used to slightly fix elements placement in the grid. That fix is
	 * no always mandatory - it depends on you background image. If there is no need to correct
	 * position, please set these constants to -1.
	 */

	/** @constant {Number} ROW_CORRECTION - at which row start correction */
	Grid.ROW_CORRECTION = 4;

	/** @constant {Number} COL_CORRECTION - at which column start correction */
	Grid.COL_CORRECTION = 6;

	/** Constants: directions in which elements may move */
	/** @constant {Number} */
	Grid.DIR_RIGHT = 1;

	/** @constant {Number} */
	Grid.DIR_LEFT = 2;

	/** @constant {Number} */
	Grid.DIR_UP = 3;

	/** @constant {Number} */
	Grid.DIR_DOWN = 4;

	/** Constants: speed */
	/** @constant {Number} SPEED_X - movement speed of the elements on X-axis */
	Grid.SPEED_X = 5;

	/** @constant {Number} SPEED_Y - movement speed of the elements on Y-axis */
	Grid.SPEED_Y = 5;

	/** Constants: possible types of single grid elements
	 * IMPORTANT NOTE
	 * Values representing types are also used to find a correct image file for the element.
	 * For example path to the image for red elements ends with '.../coin_0.png', for green '.../coin_2.png' etc.
	 */
	/**  TYPE_RED to TYPE_BLUE - active elements */
	/** @constant {Number} */
	Grid.TYPE_RED = 0;

	/** @constant {Number} */
	Grid.TYPE_YELLOW = 1;

	/** @constant {Number} */
	Grid.TYPE_GREEN = 2;

	/** @constant {Number} */
	Grid.TYPE_PURPLE = 3;

	/** @constant {Number} */
	Grid.TYPE_BLUE = 4;

	/** @constant {Number} NUM_OF_TYPES - number of active elements */
	Grid.NUM_OF_TYPES = 5;

	/**
	@constant {Number} TYPE_BLANK - temporary type of the element, which appears when math-3 or more is found
	*/
	Grid.TYPE_BLANK = 5;

	/**
	@constant {Number} TYPE_EMPTY - not active, not moveable elements, through which active elements may move
	*/
	Grid.TYPE_EMPTY = 6;

	/** Constants: possible grid types (without empty fields or with empty fields in different spots */
	/** @constant {Number} */
	Grid.GRID_NORMAL = 0;

	/** @constant {Number} */
	Grid.GRID_CORNERS_1 = 1;

	/** @constant {Number} */
	Grid.GRID_CORNERS_2 = 2;

	/** @constant {Number} */
	Grid.GRID_BORDERS = 3;

	/** @constant {Number} */
	Grid.GRID_CENTER_1 = 4;

	/** @constant {Number} */
	Grid.GRID_CENTER_2 = 5;

	/** Constants: positions of buttons 'sound', 'music' and 'fullscreen' */
	/** @constant {Number} */
	Grid.BUTTON_X = 245;

	/** @constant {Number} */
	Grid.BUTTON_Y = 280;

	/** @constant {Number} */
	Grid.BUTTON_OFFSET = 45;

	/** Constants: zindexes of background and grid elements */
	/** @constant {Number} */
	Grid.ZID_BG = 0;
	/** @constant {Number} */
	Grid.ZID_ELEM = 1;

	/** Constants determining where to look for images */
	/** @constant {String} */
	Grid.IMG_BASE = '';

	/** @constant {String} */
	Grid.IMG_PREFIX = 'coin_';

	/** @constant {String} */
	Grid.PARTICLES_BASE = 'particles';

	/** @constant {String} */
	Grid.PARTICLES_PREFIX = 'star_';

	/** Constants: determine particles */
	/** @constant {Number} */
	Grid.EMMITER_PARTICLES_AMOUNT = 18;

	/** @constant {Number} */
	Grid.EMMITER_PARTICLES_LIFETIME = 350;

	/** @constant {Number} */
	Grid.EMMITER_PARTICLE_WIDTH = 120;

	/** @constant {Number} */
	Grid.EMMITER_PARTICLE_HEIGHT = 120;

	Grid.property(/**@lends PiratesApp.Grid.prototype*/{

		/** Index of first picked element */
		state: Grid.STATE_GAME,

		/** If true player can perform actions on grid */
		ready: false,

		/** After firs playthrough set to true */
		backToIntro: false,

		/** Determines type of the grid: with or without empty elements */
		type: 0,

		/** Stores Element objects which represent the level */
		level: null,

		/** Stores elements that will be dropped down if match-3 (or more) is found */
		toDrop: null,

		/** refiller An extra array used to refill grid */
		refiller: null,

		/** toDropRefiller Which refiller columns should be dropped down in case to refill the grid */
		toDropRefiller: null,

		/**
		* blankInColumn array of static size and dynamic values. Updated when matching elements are found.
		* Stores number of blank elements in each columns
		*/
		blankInColumn: null,

		/**
		* emptyInColumns stores number of empty (black) elements in each column IF those
		* elements start at first row \
		*/
		emptyInColumn: null,

		/** An array used to count falling distances of elements */
		occupied: null,

		/** Used to move pickers around the grid */
		positions: null,

		particles: null,

		/** Index of first picked element */
		firstPick: -1,

		/** Index of second picked element */
		secondPick: -1,

		/** Stores info needed for swap operations */
		swap: {},

		/** Stores flags determining what kind of animations is now performed */
		animate: {},

		/** Points to Engine.Scene object */
		sceneHandler: null,

		/** Points to the Score object which is updated when player playes this Grid */
		scoreHandler: null,

		/**  Storing images other than gameplay elements */
		images: null,

		/** Used to highlight clicked elements */
		pickers: null,

		/** Stores sound, music and fullscreen buttons */
		buttons: null,

		/** Used to toggle fullscreen mode */
		fullscreen: false,

		/** handler for the viewport which is used to switch fullscreen */
		vPort: null,

	});

	Grid.method({

		/**
		 * @param {Object} arg Functions set fill for this object based on it's type
		 */
		setArgFill: function(arg){

			arg.fill = PiratesApp.IMG_BASE.format(Grid.IMG_BASE, Grid.IMG_PREFIX + arg.type, PiratesApp.IMG_EXTENSION);

		},

		/**
		 * Generates grid free of match-3 or more
		 * @param {Number} type Passed from Grid.init() call param
		 * @returns {Array} an array which stores types of elements
		 */
		generateGrid: function(type){

			var tempLevel = new Array();
			var i, k;
			var current, prev_1, prev_2, row;
			var doBreak = false;

			// check for 3s in rows
			for (i = 0; i < Grid.GRID_SIZE; i++) {

				row = getFloor( i / Grid.GRID_BREAK );

				// new element to be put in an array
				current = getFloor( randomize() * Grid.NUM_OF_TYPES );

				// don't check if we are not in third coolumn or further
				if (i % Grid.GRID_BREAK <= 1) {

					tempLevel.push(current);
					continue;

				}

				// element from the same row, previous column
				prev_1 = tempLevel[i-2];

				// element from the same row, 2 columns earlier
				prev_2 = tempLevel[i-1];

				// Check if new element and previous two create a match-3...
				if (current !== prev_1 || current !== prev_2) {

					tempLevel.push(current);
					continue;

				}

				// ... they do, so genereate new elements until they don't
				while (true) {

					if (current === Grid.NUM_OF_TYPES - 1) current = 0;
					else current++;

					if ( current !== prev_1 || current !== prev_2) {

						tempLevel.push(current);
						break;

					}

				}

			}

			// Check for 3s in columns. It works on an array already filled and with no 3s in rows.
			for (i = Grid.GRID_BREAK * 2; i < Grid.GRID_SIZE; i++) {

				current = tempLevel[i];
				prev_1 = tempLevel[i - Grid.GRID_BREAK * 2];
				prev_2 = tempLevel[i - Grid.GRID_BREAK];

				// 3 currently being checked elements don't create match-3 situation, go further in the loop
				if (current !== prev_1 || current !== prev_2) continue;

				doBreak = false;
				while(true){

					// There is a match-3 in a column. Search for a value for the element, which
					// will free the column of match-3 situation AND won't create such situation in any near row.
					current = getFloor(randomize() * Grid.NUM_OF_TYPES);

					if (current === prev_1)	doBreak = false;
					else {

						if (i % Grid.GRID_BREAK === 0) {

							if(current != tempLevel[i + 1]) doBreak = true;

						}

						else if (i % Grid.GRID_BREAK > 0 && i % Grid.GRID_BREAK < Grid.GRID_BREAK-1) {

							if (current != tempLevel[i - 1] && current != tempLevel[i + 1])	doBreak = true;

						}

						else if (i % Grid.GRID_BREAK === Grid.GRID_BREAK - 1) {

							if (current != tempLevel[i - 1]) doBreak = true;

						}

					}

					if (doBreak) {

						tempLevel[i] = current;
						break;

					}

				}

			}

			if (type > 0) {

				for (i = 0; i < Grid.GRID_SIZE; i++)
					if (PiratesApp.Levels[type - 1][i] === 1) tempLevel[i] = Grid.TYPE_EMPTY;

			}

			// fill 'emptyInColumn' array (feature for optimization) in handling empty fields
			for (i = 0; i < Grid.GRID_BREAK; i++) {

				k = 0;
				this.emptyInColumn[i] = 0;
				if (tempLevel[i] === Grid.TYPE_EMPTY) {

					while (tempLevel[i + k * Grid.GRID_BREAK] === Grid.TYPE_EMPTY)
						k++;

					this.emptyInColumn[i] = k;

				}

			}

			return tempLevel;

		},

		/**
		 * Reloads the grid at the end of the game, when player has chosen REPLAY
		 * or if there are no 3s in the current interation of the grid
		 */
		reloadGrid: function(type){

			this.type = type;
			var tempGrid = this.generateGrid(type);

			for (i = 0; i < Grid.GRID_SIZE; i++) {

				this.level[i].type = tempGrid[i];
				this.level[i].shape.children[0].setFill(PiratesApp.IMG_BASE.format(Grid.IMG_BASE, Grid.IMG_PREFIX + this.level[i].type, PiratesApp.IMG_EXTENSION));

				this.refiller[i].index = -1;

			}

			this.ready = true;

		},

		/**
		 * Simple, fast grid generation, without checking for 3s and randomization
		 * @returns {Array} returned is an array which stores types of elements
		 */
		generateSimpleGrid: function(){

			var tempLevel = new Array();
			var currentType = 0;

			for (i = 0; i <  Grid.GRID_SIZE; i++) {

				tempLevel.push(currentType);
				if (++currentType === Grid.NUM_OF_TYPES) currentType = 0;

			}

			return tempLevel;

		},

		/**
		 * Called when mouse is clicked on single grid element (Element)
		 * @param {Number} index Index of the element which has been clicked
		 */
		performClick: function(index){

			if (this.level[index].type === Grid.TYPE_EMPTY) return;

			if (this.firstPick < 0) {

				// first element picked
				this.firstPick = index;

				this.pickers[0].setPosition(this.positions[index].x, this.positions[index].y);
				this.pickers[0].setOpacity(0.6);
				this.pickers[0].captureEvents = true;

			} else {

				if (this.firstPick === index) {

					// the same element picked - unpick it
					this.firstPick = -1;
					this.secondPick = -1;

					this.pickers[0].setOpacity(0);

				} else {

					// check if legal move
					if (index === this.firstPick + 1 || index === this.firstPick - 1
						|| index === this.firstPick - Grid.GRID_BREAK
						|| index === this.firstPick + Grid.GRID_BREAK)
					{

						PiratesApp.Sound.playSound(PiratesApp.Sound.SND_SWAP);

						// second element picked - check what kind (left, up, etc) of move is needed
						this.secondPick = index;

						this.pickers[1].setPosition(this.positions[index].x, this.positions[index].y);
						this.pickers[1].setOpacity(0.6);

						// set swap parameters
						this.swap.direction = this.findDirection();
						this.swap.iteration = 1;
						this.animate.swap = true;
						this.ready = false;
						this.performSwap();

					} else {

						this.pickers[0].setPosition(this.positions[index].x, this.positions[index].y);
						this.firstPick = index;

					}

				}

			}

		},

		/**
		 * performs swap on this.firstPick and this.secondPick elements
		 */
		performSwap: function(){

			this.ready = false;

			switch (this.swap.direction){

				case Grid.DIR_DOWN:

					this.swap.currDistance += Grid.SPEED_Y;
					if (this.swap.currDistance >= Grid.OFFSET_Y) {

						this.swap.currDistance = this.swap.currDistance - Grid.OFFSET_Y;
						this.animate.swap = false;

						this.level[this.firstPick].shape.translate(0, Grid.SPEED_Y - this.swap.currDistance);
						this.level[this.secondPick].shape.translate(0, -(Grid.SPEED_Y - this.swap.currDistance));

					} else {

						this.level[this.firstPick].travel(0, 1);
						this.level[this.secondPick].travel(0, -1);

					}
				break;

				case Grid.DIR_UP:

					this.swap.currDistance += Grid.SPEED_Y;
					if (this.swap.currDistance >= Grid.OFFSET_Y) {

						this.swap.currDistance = this.swap.currDistance - Grid.OFFSET_Y;
						this.animate.swap = false;

						this.level[this.firstPick].shape.translate(0, -(Grid.SPEED_Y - this.swap.currDistance));
						this.level[this.secondPick].shape.translate(0, Grid.SPEED_Y - this.swap.currDistance);

					} else {

						this.level[this.firstPick].travel(0, -1);
						this.level[this.secondPick].travel(0, 1);

					}
				break;

				case Grid.DIR_LEFT:

					this.swap.currDistance += Grid.SPEED_X;
					if (this.swap.currDistance >= Grid.OFFSET_X) {

						this.swap.currDistance = this.swap.currDistance - Grid.OFFSET_X;
						this.animate.swap = false;

						this.level[this.firstPick].shape.translate(-(Grid.SPEED_X - this.swap.currDistance), 0);
						this.level[this.secondPick].shape.translate(Grid.SPEED_X - this.swap.currDistance, 0);

					} else {

						this.level[this.firstPick].travel(-1, 0);
						this.level[this.secondPick].travel(1, 0);

					}
				break;

				case Grid.DIR_RIGHT:

					this.swap.currDistance += Grid.SPEED_X;
					if (this.swap.currDistance >= Grid.OFFSET_X) {

						this.swap.currDistance = this.swap.currDistance - Grid.OFFSET_X;
						this.animate.swap = false;

						this.level[this.firstPick].shape.translate(Grid.SPEED_X - this.swap.currDistance, 0);
						this.level[this.secondPick].shape.translate(-(Grid.SPEED_X - this.swap.currDistance), 0);

					} else {

						this.level[this.firstPick].travel(1, 0);
						this.level[this.secondPick].travel(-1, 0);

					}
				break;

			}

			if (!this.animate.swap) {

				this.swap.currDistance = 0;

				this.level[this.firstPick].index = [this.level[this.secondPick].index,
					this.level[this.secondPick].index = this.level[this.firstPick].index][0];

				this.level.swap(this.firstPick, this.secondPick);

				this.pickers[0].setOpacity(0);
				this.pickers[1].setOpacity(0);
				this.pickers[0].captureEvents = false;

				if (this.swap.iteration < 2) this.checkNeighbours();
				else {

					this.ready = true;
					this.firstPick = this.secondPick = -1;

				}

			}

		},

		/**
		 * Used to find direction in which picked elements will be swapped
		 * @returns {Number} return value represents direction in which swap will be performed
		 */
		findDirection: function(){

			if (this.secondPick > this.firstPick)
				return this.secondPick === this.firstPick + 1 ? Grid.DIR_RIGHT : Grid.DIR_DOWN;

			return this.firstPick === this.secondPick + 1 ? Grid.DIR_LEFT : Grid.DIR_UP;

		},

		/**
		 *  Used to check if swapped elements form a 3.
		 * 1. function goes through rows or column in which swap has been performed
		 * 2. if match of 3 is found then indices of those 3 (or more)
		 * elements are added to 'toRemove' array
		 * 3. at the end function goes through 'toRemove' array and removes proper elements
		 */
		checkNeighbours: function(){

			var toRemove = [];

			// find 3s in row (or rows)
			var row_1 = getFloor(this.firstPick / Grid.GRID_BREAK);
			var row_2 = getFloor(this.secondPick / Grid.GRID_BREAK);

			var loopStart = [row_1];

			// is swap on two rows?
			if (row_1 !== row_2) loopStart.push(row_2);

			var match;
			var checked = 0;
			var i = 0, k = 0, z;

			while (checked < loopStart.length) {

				toRemove = toRemove.concat(this.findMatchInRow(loopStart[checked]));
				checked++;

			}

			// find 3s in columns
			row_1 = this.firstPick % Grid.GRID_BREAK;   // column 1
			row_2 = this.secondPick % Grid.GRID_BREAK;  // column 2

			loopStart = [row_1];
			loopStart.push(row_1);

			// is swap on two columns?
			if (row_1 !== row_2) loopStart.push(row_2);

			checked = 0;
			while (checked < loopStart.length) {

				toRemove = toRemove.concat(this.findMatchInColumn(loopStart[checked]));
				checked++;

			}

			checked = toRemove.length;
			if (checked > 2) {

				var self = this;

				this.scoreHandler.addScore(checked);
				this.scoreHandler.setScore(this.scoreHandler.currentScore);

				this.swap.iteration = 0;
				this.firstPick = this.secondPick = -1;

				var rnd;
				var particleLeft, particleTop, particleImg;

				var self = this;
				for (i = 0; i < checked; i++) {

					match = this.level[toRemove[i]];

					if (match.type !== Grid.TYPE_BLANK)	this.prepareParticles(match);

					match.shape.children[0].setOpacity(0);
					match.type = Grid.TYPE_BLANK;

				}

				PiratesApp.Sound.playSound(PiratesApp.Sound.SND_DESTROY);

				this.ready = false;
				this.prepareDrop();
				this.prepareRefiller();
				this.doCheck = true;

			} else {

				// swap back
				this.firstPick = [this.secondPick, this.secondPick = this.firstPick][0];
				this.swap.direction = this.findDirection();
				this.swap.iteration = 2;
				this.animate.swap = true;
				this.performSwap();

			}

		},

		/**
		 * Prepares particles
		 * @param {Object} elem Pointer to the element which will be removed, and in it's place particles will appear
		 */
		prepareParticles: function(elem){

			var self = this;

			var tmp = elem.shape.children[0].bb;

			var particleLeft = tmp.x - 25;
			var particleTop = tmp.y - 25;
			var particleImg = PiratesApp.IMG_BASE.format(Grid.PARTICLES_BASE, Grid.PARTICLES_PREFIX + elem.type, PiratesApp.IMG_EXTENSION);

			this.particles.push(new EngineParticles({
				parent: self.sceneHandler,
				amount: Grid.EMMITER_PARTICLES_AMOUNT,
				width: Grid.EMMITER_PARTICLE_WIDTH,
				height: Grid.EMMITER_PARTICLE_HEIGHT,
				left: particleLeft,
				top: particleTop,
				autoplay: true,
				iterations: 0,
				zindex: 1,
				fill: particleImg,
				on: {
					beforecreateparticle: function(){

						rnd = randomize() * 500;
						this.lifetime = (rnd + Grid.EMMITER_PARTICLES_LIFETIME);
						this.dx = rnd * Math.sin( this.lifetime * 3.14);
						this.dy = rnd * Math.cos( this.lifetime * 3.14);

					},
				}
			}));
		},

		findMatchInRow: function(row){

			var current, prev1, prev2, tmp;
			var retArray = [];

			tmp = (row + 1) * Grid.GRID_BREAK;
			for (i = row * Grid.GRID_BREAK + 2; i < tmp; i++) {

				current = this.level[i].type;
				if (current === Grid.TYPE_EMPTY) continue;

				prev1 = this.level[i - 1].type;
				prev2 = this.level[i - 2].type;

				if (current === prev1 && current === prev2) {

					retArray.add(i);
					retArray.add(i - 1);
					retArray.add(i - 2);

					// simple optimization
					if (i < (row + 1) * Grid.GRID_BREAK - 3 && this.level[i+1].type !== current) i += 2;

				}

			}

			return retArray;

		},

		findMatchInColumn: function(col){

			var current, prev1, prev2, tmp;
			var retArray = [];

			tmp = col + Grid.GRID_ROWS * Grid.GRID_BREAK
			for (i = col + 2 * Grid.GRID_BREAK; i < tmp; i += Grid.GRID_BREAK) {

				current = this.level[i].type;
				if (current === Grid.TYPE_EMPTY) continue;

				prev1 = this.level[i - Grid.GRID_BREAK].type;
				prev2 = this.level[i - 2*Grid.GRID_BREAK].type;

				if (current === prev1 && current === prev2) {

					retArray.add(i);
					retArray.add(i - Grid.GRID_BREAK);
					retArray.add(i - Grid.GRID_BREAK*2);

					// simple optimization
					if (i < col + Grid.GRID_BREAK * (Grid.GRID_ROWS - 3) && this.level[i + Grid.GRID_BREAK].type !== current)
						i += Grid.GRID_BREAK*2;

				}

			}

			return retArray;

		},

		/**
		 * Prepares refiller elements to drop down and refill the grid
		 */
		prepareRefiller: function(){

			var i, k, numOfEmpty;
			var ref;

			var len = this.toDrop.length;

			for (i = 0; i < Grid.GRID_BREAK; i++) {

				ref = this.toDropRefiller[i];
				ref.fallen = 0;
				ref.ready = false;
				ref.dist = 0;
				ref.toDrop = 0;
				ref.dropRows = 0;

			}

			// take drop values from normal grid elements which are highest in each column
			// and assign them as drop for corresponding refiller column also
			for (i = 0; i < len; i++) {

				ref = this.toDrop[i];
				if ( getFloor (ref.index / Grid.GRID_BREAK) === this.emptyInColumn[ref.index % Grid.GRID_BREAK]) {

					for (k = 0; k < Grid.GRID_BREAK; k++) {

						if (ref.index % Grid.GRID_BREAK === k) {

							if (this.toDropRefiller[k].dist === 0) this.toDropRefiller[0].toDrop++;
							this.toDropRefiller[k].dist = ref.dist;
							break;

						}

					}

				}

			}

			for (i = 0; i < Grid.GRID_BREAK; i++) {

				ref = this.toDropRefiller[i];

				// First element in a column if of type BLANK.
				if (this.level[i].type === Grid.TYPE_BLANK) {

					this.toDropRefiller[0].toDrop++;
					ref.dist = this.blankInColumn[i][0];

				}

				// First element in a column is of type EMPTY.
				else if (this.level[i].type === Grid.TYPE_EMPTY) {

					numOfEmpty = this.emptyInColumn[i];

					// Next element is not of type EMPTY...
					if (this.level[i + numOfEmpty * Grid.GRID_BREAK].type !== Grid.TYPE_EMPTY) {

						// ... and it's not BLANK also, so no drop in this column for refiller
						// or increase drop if elements below will fall (current toDropRefiller.dist > 0)
						if (this.level[i + numOfEmpty * Grid.GRID_BREAK].type !== Grid.TYPE_BLANK)	{

							if (ref.dist > 0) {

								ref.dropRows = ref.dist;
								ref.dist += numOfEmpty;

							}

						} else {

							// Next element is of type BLANK so add number of blanks to falling distance
							numOfEmpty += this.blankInColumn[i][0];
							if(ref.dist === 0) this.toDropRefiller[0].toDrop++;
							ref.dropRows = this.blankInColumn[i][0];
							ref.dist = numOfEmpty;

						}

					}

				}

				// set indices that 'refiller' elements from this column will have
				// in 'level' array after drop (those indices depend on drop distance)
				numOfEmpty = ref.dist;
				if (numOfEmpty > 0) {

					k = 0;
					while (k < numOfEmpty) {

						this.refiller[i + Grid.GRID_BREAK * k].index = i + Grid.GRID_BREAK * (numOfEmpty - k - 1);
						k++;

					}

				}

				ref.dist *= Grid.OFFSET_Y;

			}

			this.animate.dropRefiller = true;
			PiratesApp.Sound.playRefillSound();

		},

		/**
		 * Fired after match-3 or more are removed from the grid
		 */
		prepareDrop: function(){

			var i = 0, count;
			var tempElem, tempDist;
			var doBreak;

			this.toDrop = new Array();

			// clear 'fields to be occupied' array
			this.occupied = new Array(Grid.GRID_SIZE);

			// count blanks in columns
			var tmp;
			this.blankInColumn = new Array(Grid.GRID_BREAK);
			for (i = 0; i < Grid.GRID_BREAK; i++) {

				tmp = this.blankInColumn[i] = new Array(Grid.GRID_ROWS);

				for (k = 0; k < Grid.GRID_ROWS; k++) {

					this.occupied[i + k * Grid.GRID_BREAK] = 0;

					tmp[k] = 0;

					for (z = k; z < Grid.GRID_ROWS; z++)
						if (this.level[i + z * Grid.GRID_BREAK].type === Grid.TYPE_BLANK)	tmp[k]++;

				}

			}

			// go through the whole grid, except for the last row, starting at the top
			for (i = 0; i < Grid.GRID_SIZE - Grid.GRID_BREAK; i++) {

				// if current element (i) is not BLANK or EMPTY...
				if (this.level[i].type !== Grid.TYPE_BLANK && this.level[i].type === Grid.TYPE_EMPTY) continue;

				// ...check if the element below is BLANK
				if (this.level[i + Grid.GRID_BREAK].type === Grid.TYPE_BLANK) {

					// get falling distance from 'blankInColumn' array
					this.addToDrop(i, this.blankInColumn[i % Grid.GRID_BREAK][getFloor(i / Grid.GRID_BREAK)]);

				}

				// if the element below is EMPTY
				else if (this.level[i + Grid.GRID_BREAK].type === Grid.TYPE_EMPTY) {

					count = 1;
					while (true) {

						if (i + Grid.GRID_BREAK * count >= Grid.GRID_SIZE) {

							count = 0;
							break;

						}

						if (this.level[i + Grid.GRID_BREAK * count].type !== Grid.TYPE_EMPTY) break;

						count++;

					}

					// 'count' now stores a (number of EMPTY elements + 1) or 0

					if (this.level[i + count * Grid.GRID_BREAK].type === Grid.TYPE_BLANK && count > 0)
						this.addToDrop(i, this.blankInColumn[i % Grid.GRID_BREAK][ getFloor(i / Grid.GRID_BREAK)] + count - 1);

				}

			} // for on i

			this.animate.drop = true;

		},

		/**
		 * Adds an element to drop list. Used in 'prepareDrop' function
		 * @param {Number} index Which element to add
		 * @param {Number} distance What is the drop distance for element being added
		 */
		addToDrop: function(index, distance){

			var fallingElem;

			var z;
			var count, k, tempDist;
			var add;

			z = index + Grid.GRID_BREAK;
			while (z >= Grid.GRID_BREAK) {

				z -= Grid.GRID_BREAK;
				if (this.level[z].type === Grid.TYPE_BLANK) break;

				// don't move EMPTY and BLANK elements
				if (this.level[z].type === Grid.TYPE_EMPTY) continue;

				tempDist = distance;
				count = 0;
				// check if the element would fall on EMPTY
				if (this.level[z + distance*Grid.GRID_BREAK].type === Grid.TYPE_EMPTY) {

					// set pointer on first EMPTY element
					k = z + Grid.GRID_BREAK;
					while (this.level[k].type !== Grid.TYPE_EMPTY)
						k += Grid.GRID_BREAK;

					// k is the index of first EMPTY element before the one currently being added to drop
					// count how many EMPTY elements are below it
					while (this.level[k].type === Grid.TYPE_EMPTY) {

						count++;
						k += Grid.GRID_BREAK;

					}

					if (this.occupied[k] === 1)	tempDist -= count;
					else tempDist += count;

				}

				add = true;
				for (k = 0; k < this.toDrop.length; k++)
					if (this.toDrop[k].index === z) {

						add = false;
						break;

					}

				if (add) {

					fallingElem = {
						index: z,
						dist: tempDist,
						distance: tempDist * Grid.OFFSET_Y,
						ready: false,
						fallen: 0
					};

					this.toDrop.push(fallingElem);

					this.occupied[z + tempDist * Grid.GRID_BREAK] = 1;

				} else break;

			}

		},

		/**
		 * Animates drop of the elements which happened to be above blank fields
		 */
		performDrop: function(){

			var count = 0, i = 0, k = 0;
			var temp, tempIndex, ref;
			var len = this.toDrop.length;

			// go through 'toDrop' array, which holds elements that should be moved down the grid
			for (i = 0; i < len; i++) {

				ref = this.toDrop[i];
				if (ref.ready) count++;
				else {

					ref.fallen += Grid.SPEED_Y;

					if (ref.fallen >= ref.distance) {

						count++;
						ref.fallen = ref.fallen - ref.distance;
						this.level[ref.index].shape.translate(0, Grid.SPEED_Y - ref.fallen);
						ref.ready = true;

					} else this.level[ref.index].shape.translate(0, Grid.SPEED_Y);

				}

			}

			if (count < len) return;

			this.animate.drop = false;

			for (k = Grid.GRID_ROWS; k >= 0; k--) {
				for (i = 0; i < len; i++) {

					ref = this.toDrop[i];
					if ( getFloor( ref.index / Grid.GRID_BREAK ) !== k) continue;

					tempIndex = ref.index;
					temp = ref.dist * Grid.GRID_BREAK;

					// change indices
					this.level[tempIndex + temp].index = this.level[tempIndex].index;
					this.level[tempIndex].index += temp;

					this.level.swap(tempIndex, this.level[tempIndex].index);

					// change position of swapped element (the one which was moved down has OK coords)
					this.level[tempIndex].shape.translate(0, -ref.distance);

				}

			}

		},

		/**
		 * Performs animation of refiller elements falling down from above the grid
		 */
		dropRefiller: function(){

			this.countFrames++;

			if (this.countDrops === this.toDropRefiller[0].toDrop) {

				this.countDrops = 0;
				this.countFrames = 0;
				this.animate.dropRefiller = false;

				return;

			}

			var temp, border, ref;

			// drop elements from refiller
			for (i = 0; i < Grid.GRID_BREAK; i++) {

				ref = this.toDropRefiller[i];
				if (ref.ready) continue;

				if (ref.dist > 0) {

					border = ref.dropRows > 0 ? ref.dropRows : Grid.GRID_ROWS;

					ref.fallen += Grid.SPEED_Y;

					if (ref.fallen >= ref.dist) {

						// prevent position anomalies
						ref.fallen -= ref.dist;
						for (k = 0; k < border; k++) {

							temp = this.refiller[i + k * Grid.GRID_BREAK].shape;
							temp.translate(0, Grid.SPEED_Y - ref.fallen);

							if (temp.children[0].bb.y > Grid.START_Y + 8) temp.children[0].setOpacity(1);

						}

						//ref.fallen = Grid.SPEED_Y - correction;
						ref.ready = true;
						this.countDrops++;

					} else {

						for (k = 0; k < border; k++) {

							temp = this.refiller[i + k * Grid.GRID_BREAK].shape;
							temp.translate(0, Grid.SPEED_Y);

							if (temp.children[0].bb.y > Grid.START_Y + 8) temp.children[0].setOpacity(1);

						}

					}

				}

			}

		},

		/**
		 * Updates grid data after each move which changed it (where match-3 or more has been found)
		 */
		updateData: function(){

			var temp;

			for (i = 0; i < Grid.GRID_SIZE; i++) {

				temp = this.refiller[i].index;
				if (temp !== -1 && this.level[temp].type !== Grid.TYPE_EMPTY) {

					this.level[temp].index = temp;
					this.level[temp].type = this.refiller[i].type;

					this.level[temp].shape.children[0].zindex = Grid.ZID_ELEM;
					this.level[temp].shape.children[0].setFill(PiratesApp.IMG_BASE.format(Grid.IMG_BASE, Grid.IMG_PREFIX + this.level[temp].type, PiratesApp.IMG_EXTENSION));
					this.level[temp].shape.children[0].setOpacity(1);

				}

			}

			this.reloadRefiller();
			this.checkGrid();

		},

		/**
		 * Reloads 'refiller' array after some of its elements has been used to refill the grid
		 */
		reloadRefiller: function(){

			var temp, distance, border;

			// drop elements from refiller
			for (i = 0; i < Grid.GRID_BREAK; i++) {

				border = this.toDropRefiller[i].dropRows > 0 ? this.toDropRefiller[i].dropRows : Grid.GRID_ROWS;

				distance = this.toDropRefiller[i].dist;
				if (distance > 0) {

					for (k = 0; k < border; k++) {

						temp = this.refiller[i + k * Grid.GRID_BREAK];
						temp.shape.translate(0, -distance);
						temp.type =  getFloor( randomize() * Grid.NUM_OF_TYPES );
						temp.shape.children[0].setOpacity(0);
						temp.index = -1;

						temp.shape.children[0].setFill(PiratesApp.IMG_BASE.format(Grid.IMG_BASE, Grid.IMG_PREFIX + temp.type, PiratesApp.IMG_EXTENSION));

					}

				}

			}

		},

		/**
		 * after each refill check if there are new 3s to remove
		 */
		checkGrid: function(){

			var toRemove = [];

			var i, current, prev_1, prev_2, row;

			for (i = 2; i <  Grid.GRID_SIZE; i++) {

				current = this.level[i].type;
				if (current === Grid.TYPE_EMPTY) continue;

				if (i % Grid.GRID_BREAK > 1) {

					prev_1 = this.level[i-2].type;
					prev_2 = this.level[i-1].type;

					if (current === prev_1 && current === prev_2) {

						toRemove.add(i);
						toRemove.add(i-1);
						toRemove.add(i-2);

					}

				}

				if (i < Grid.GRID_BREAK * 2) continue;

				prev_1 = this.level[i - Grid.GRID_BREAK * 2].type;
				prev_2 = this.level[i - Grid.GRID_BREAK].type;

				if (current === prev_1 && current === prev_2) {

					toRemove.add(i);
					toRemove.add(i - Grid.GRID_BREAK);
					toRemove.add(i - Grid.GRID_BREAK*2);

				}

			}

			row = toRemove.length;

			if (row > 2) {

				this.scoreHandler.addScore(row);
				this.scoreHandler.setScore(this.scoreHandler.currentScore);

				this.swap.iteration = 0;
				var self = this;

				// stuff for particles
				var rnd, particleLeft, particleTop, particleImg;

				for (i = 0; i < row; i++) {

					match = this.level[toRemove[i]];

					if (match.type !== Grid.TYPE_BLANK) this.prepareParticles(match);

					match.shape.children[0].setOpacity(0);
					match.type = Grid.TYPE_BLANK;

				}

				PiratesApp.Sound.playSound(PiratesApp.Sound.SND_DESTROY);

				this.ready = false;
				this.prepareDrop();
				this.prepareRefiller();
				this.doCheck = true;

			}
			else {

				if (this.isSolvable()) this.ready = true;
				else this.reloadGrid(this.type);

			}

		},

		/**
		 * After each grid alteration it has to be checked if grid is still solvable, which means that there
		 * are pairs of elements that, if will be moved one way or another, will form a match-3 with other elements
		 */
		isSolvable: function(){

			var i, row = -1, col = 0;
			var ref, tmp;

			for (i = 0; i < Grid.GRID_SIZE; i++) {

				if (i % Grid.GRID_BREAK === 0) {

					col = 0;
					row++;

				}

				ref = this.level[row * Grid.GRID_BREAK + col].type;
				tmp = row * Grid.GRID_BREAK;

				if (ref === Grid.TYPE_EMPTY) continue;

				// xxox
				if (col < Grid.GRID_BREAK - 3) {

					if (ref === this.level[tmp + col + 1].type && this.level[tmp + col + 3].type === ref)
						return true;

				}

				// xoxx
				if (col > 1 && col < Grid.GRID_BREAK - 1) {

					if (ref === this.level[tmp + col + 1].type && this.level[tmp + col - 2].type === ref)
						return true;

				}

				// x
				// x
				// o
				// x
				if (row < Grid.GRID_ROWS - 3) {

					if (ref === this.level[(row + 1) * Grid.GRID_BREAK + col].type && this.level[(row + 3) * Grid.GRID_BREAK + col].type === ref)
						return true;

				}

				// x
				// o
				// x
				// x
				if (row > 1 && row < Grid.GRID_ROWS - 1) {

					if (ref === this.level[(row+1) * Grid.GRID_BREAK + col].type && this.level[(row - 2) * Grid.GRID_BREAK + col].type === ref)
						return true;

				}

				// oox      xxo
				// xxo  or  oox
				if (col < Grid.GRID_BREAK - 2) {

					if (ref === this.level[tmp + col + 1].type) {

						if (row > 0 && this.level[(row - 1) * Grid.GRID_BREAK + col + 2].type === ref)
							return true;

						if (row < Grid.GRID_ROWS - 1 && this.level[(row + 1) * Grid.GRID_BREAK + col + 2].type === ref)
							return true;

					}

				}

				// xoo      oxx
				// oxx  or  xoo
				if (col > 0 && col < Grid.GRID_BREAK - 1) {

					if (ref === this.level[tmp + col + 1].type) {

						if (row > 0 && this.level[(row - 1) * Grid.GRID_BREAK + col - 1].type === ref)
							return true;

						if (row < Grid.GRID_ROWS - 1 && this.level[(row + 1) * Grid.GRID_BREAK + col - 1].type === ref)
							return true;

					}

				}

				// xo      ox
				// xo      ox
				// ox  or  xo
				if (row < Grid.GRID_ROWS - 2) {

					if (col < Grid.GRID_BREAK - 1 && ref === this.level[(row + 1) * Grid.GRID_BREAK + col].type)
						if (this.level[(row + 2) * Grid.GRID_BREAK + col + 1].type === ref)
							return true;

					if (col > 0 && ref === this.level[(row + 1) * Grid.GRID_BREAK + col].type)
						if (this.level[(row + 2) * Grid.GRID_BREAK + col - 1].type === ref)
							return true;

				}

				// ox      xo
				// xo      ox
				// xo  or  ox
				if (row > 1) {

					if (col > 0 && ref === this.level[(row - 1) * Grid.GRID_BREAK + col].type)
						if (this.level[(row - 2) * Grid.GRID_BREAK + col - 1].type === ref)
							return true;

					if (col < Grid.GRID_BREAK - 1 && ref === this.level[(row - 1) * Grid.GRID_BREAK + col].type)
						if (this.level[(row - 2) * Grid.GRID_BREAK + col + 1].type == ref)
							return true;

				}

				col++;

			}

			return false;

		},

		show: function(){

			for (i = 0; i < Grid.GRID_SIZE; i++) this.level[i].shape.children[0].setOpacity(1);
			for (i = 0; i < this.images.length-3; i++) this.images[i].setOpacity(1);

		},

		hide: function(){

			for (i = 0; i < Grid.GRID_SIZE; i++) this.level[i].shape.children[0].setOpacity(0);
			for (i = 0; i < this.images.length; i++) this.images[i].setOpacity(0);

		},

		removeImages: function(scene){

			scene.removeChild(this.images[0]);
			scene.removeChild(this.images[1]);

			scene.removeChild(this.pickers[0]);
			scene.removeChild(this.pickers[1]);

			scene.removeChild(this.buttons[0]);
			scene.removeChild(this.buttons[1]);
			scene.removeChild(this.buttons[2]);

		},

		appendImages: function(scene){

			scene.appendChild(this.images[0]);
			scene.appendChild(this.images[1]);

			scene.appendChild(this.pickers[0]);
			scene.appendChild(this.pickers[1]);

			scene.appendChild(this.buttons[0]);
			scene.appendChild(this.buttons[1]);
			scene.appendChild(this.buttons[2]);

		},

		removeFromScene: function(scene){

			for (i = 0; i < Grid.GRID_SIZE; i++) scene.removeChild(this.level[i].shape);

			this.removeImages(scene);

		},

		/**
		 * Faster version of appendTo - doesn't add 'refiller'
		 * used for second and further playthroughs
		 * @param {Engine.Scene} scene Determines to which scene this Score object will be appended
		 */
		addToScene: function(scene) {

			for (i = 0; i < Grid.GRID_SIZE; i++) scene.appendChild(this.level[i].shape);

			this.appendImages(scene);

		},

		/**
		 * @param {Engine.Scene} scene Determines to which scene this Score object will be appended
		 */
		appendTo: function(scene){

			var i = 0;

			for (i = 0; i < Grid.GRID_SIZE; i++) {

				scene.appendChild(this.refiller[i].shape);
				scene.appendChild(this.level[i].shape);

			}

			this.appendImages(scene);

		}

	});

	return Grid;

})(Engine.Geometry.Rectangle, Engine.Particles, Math.floor, Math.random)
