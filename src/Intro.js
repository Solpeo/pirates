PiratesApp.Intro = (function(EngineRect, EngineFont){

	/**
	 * Intro class is used to create pre-game screens: starting screen, about, info
	 * as well as ending game screen.
	 *
	 * @constructor
	 */
	function Intro() {

		this.images = new Array();
		this.overlays = new Array();
		this.texts = new Array();
		this.boxes = new Array();
		this.buttons = new Array();

		init(this);

	}

	/** Inits intro object */
	var init = function(self){

		if (self.vPort === null) self.vPort = false;
		else self.vPort.div.style.cursor = Intro.CURSOR_NORMAL;

		// background images for start, instructions, about and game over screens
		self.images.push(
			new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_LAYER, PiratesApp.IMG_EXTENSION),
				width: 800,
				height: 600,
				top: -300,
				left: -400,
				captureEvents: false,
				opacity: 1,
				zindex: Intro.ZID_STARTING+1,
			}),

			new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_PIRATE, PiratesApp.IMG_EXTENSION),
				width: 153,
				height: 157,
				top: -180,
				left: -76,
				captureEvents: false,
				opacity: 0,
				zindex: Intro.ZID_STARTING+1,
			}),

			new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_MAP, PiratesApp.IMG_EXTENSION),
				width: 696,
				height: 493,
				top: -298,
				left: -372,
				captureEvents: false,
				opacity: 0,
				zindex: Intro.ZID_STARTING+1,
			}),

			new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_LOGO, PiratesApp.IMG_EXTENSION),
				width: 155,
				height: 46,
				top: 25,
				left: -77,
				captureEvents: false,
				opacity: 0,
				zindex: Intro.ZID_STARTING+1,
			}),

			new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_COINS, PiratesApp.IMG_EXTENSION),
				width: 256,
				height: 107,
				top: -55,
				left: -125,
				captureEvents: false,
				opacity: 0,
				zindex: Intro.ZID_STARTING+1,
			}),

			new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_SKULL, PiratesApp.IMG_EXTENSION),
				width: 107,
				height: 112,
				top: -130,
				left: -50,
				captureEvents: false,
				opacity: 0,
				zindex: Intro.ZID_STARTING+1,
			})
		);

		// add bottom buttons (about, instructions, demo game)
		for (i = 0; i < 4; i++)
			self.overlays.push(new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_ABOUT, PiratesApp.IMG_EXTENSION),
				width: 50,
				height: 20,
				top: 224,
				left: -72,
				captureEvents: true,
				on: {
					mouseover: function(){

						self.setCursor(Intro.CURSOR_HOVER);

					},

					mouseleave: function(){

						self.setCursor(Intro.CURSOR_NORMAL);

					}
				},
				opacity: 0,
				zindex: Intro.ZID_STARTING + 2,
			})
		);

		self.overlays[0].on('mouseclick', function() {

			switch (self.state) {

				case Intro.STATE_START:
				case Intro.STATE_FINISH:
					self.setAboutPage();
				break;

				case Intro.STATE_ABOUT:
				case Intro.STATE_INFO:
					self.setStartPage();
				break;

			}

		});

		self.overlays[1].on('mouseclick', function() {

			switch (self.state) {

				case Intro.STATE_START:
				case Intro.STATE_ABOUT:
				case Intro.STATE_FINISH:
					self.setInfoPage();
				break;

				case Intro.STATE_INFO:
					self.setAboutPage();
				break;

			}

		});

		self.overlays[2].on('mouseclick', function() {

			switch (self.state) {

				case Intro.STATE_START:
					self.startGame();
				break;

				case Intro.STATE_ABOUT:
				case Intro.STATE_INFO:
				case Intro.STATE_FINISH:
					self.setStartPage();
				break;

			}

		});

		self.overlays[3].on('mouseclick', function() {

			window.open("http://www.solpeo.com");

		});

		// set 'x' (check box) images and inner functions
		for (i = 0; i < 3; i++)
			self.boxes.push( new EngineRect({
				fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_X, PiratesApp.IMG_EXTENSION),
				width: 13,
				height: 13,
				top: 87,
				left: -121 + i*115,
				captureEvents: true,
				opacity: 0.01,
				zindex: Intro.ZID_STARTING + 2,
				on: {
					mouseclick: function(){

						for (k = 0; k < 3; k++) self.boxes[k].opacity = 0.01;
						this.opacity = 1;

						for (k = 0; k < 3; k++) {

							self.boxes[k].update();
							if (self.boxes[k].opacity === 1) self.choice = k;

						}

						self.choice = 30 + self.choice * 30;

					}
				}
			})
		);

		self.boxes[0].opacity = 1;

		// prapere texts array with texts for starting screen loaded
		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'18px'}),
			text: Intro.TEXT_INTRO,
			textColor: 'black',
			left: -208,
			top: 0,
			maxWidth: Intro.MAX_WIDTH,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			zindex: Intro.ZID_STARTING + 2,
		}));

		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'18px'}),
			text: '30 seconds 60 seconds 90 seconds',
			textColor: 'black',
			left: -147,
			top: 110,
			maxWidth: Intro.MAX_WIDTH,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			zindex: Intro.ZID_STARTING + 2,
		}));

		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'18px'}),
			text: 'ABOUT',
			textColor: 'black',
			left: -70,
			top: 226,
			opacity: 0.4,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			zindex: Intro.ZID_STARTING + 2,
			captureEvents: true,
			on: {

				mouseover: function() {

					self.setCursor(Intro.CURSOR_HOVER);

				},

				mouseleave: function() {

					self.setCursor(Intro.CURSOR_NORMAL);

				},

				mouseclick: function() {

					switch (self.state) {

						case Intro.STATE_START:
						case Intro.STATE_FINISH:
							self.setAboutPage();
						break;

						case Intro.STATE_ABOUT:
						case Intro.STATE_INFO:
							self.setStartPage();
						break;

					}

				}
			}
		}));

		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'18px'}),
			text: 'INSTRUCTIONS',
			textColor: 'black',
			left: -5,
			top: 226,
			opacity: 0.4,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			zindex: Intro.ZID_STARTING + 2,
			catureEvents: true,
			on: {

				mouseover: function() {

					self.setCursor(Intro.CURSOR_HOVER);

				},

				mouseleave: function() {

					self.setCursor(Intro.CURSOR_NORMAL);

				},

				mouseclick: function() {

					switch (self.state) {

						case Intro.STATE_START:
						case Intro.STATE_ABOUT:
						case Intro.STATE_FINISH:
							self.setInfoPage();
						break;

						case Intro.STATE_INFO:
							self.setAboutPage();
						break;

					}

				}
			}
		}));

		// solpeo.com green hiperlink
		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'18px'}),
			text: 'solpeo.com!',
			textColor: '68A546',
			left: 146,
			top: -44,
			maxWidth: 88,
			textAlign: Engine.Geometry.Shape.Text.JUSTIFY,
			zindex: Intro.ZID_STARTING + 2,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			opacity: 0,
			on: {
				mouseover: function() {

					self.setCursor(Intro.CURSOR_HOVER);

				},

				mouseleave: function() {

					self.setCursor(Intro.CURSOR_NORMAL);

				},

				mouseclick: function() {

					window.open("http://www.solpeo.com");

				}
			}
		}));

		// solpeo mail text
		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'18px'}),
			text: Intro.TEXT_ABOUT_3,
			textColor: 'black',
			left: -215,
			top: 0,
			maxWidth: Intro.MAX_WIDTH,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			zindex: Intro.ZID_STARTING + 2,
			opacity: 0,
		}));

		// 'follow us:' text
		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'15px'}),
			text: 'FOLLOW US: ',
			textColor: 'black',
			left: 200,
			top: 300,
			maxWidth: Intro.MAX_WIDTH,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			zindex: Intro.ZID_STARTING + 2,
			opacity: 0,
		}));

		// 'create your game with us.'
		self.texts.push( new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Pacifico', size:'57px'}),
			text: 'create your game with us.',
			textColor: 'green',
			left: -160,
			top: 100,
			maxWidth: Intro.MAX_WIDTH,
			textAlign: Engine.Geometry.Shape.Text.PRE,
			zindex: Intro.ZID_STARTING + 2,
			opacity: 1,
		}));

		// title (Pirates, About, instructions) Pacifico
		self.title = new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Pacifico', size:'57px'}),
			text: 'Pirates',
			textColor: '411e11',
			left: -50,
			top: -245,
			maxWidth: Intro.MAX_WIDTH,
			zindex: Intro.ZID_STARTING + 2,
			opacity: 1,
		});

		// score dispaly text, value passed as a parameter in setFinishPage
		self.score = new Engine.Geometry.Shape.Text({
			font: new EngineFont({family:'Signika', size:'24px', weight:EngineFont.BOLD}),
			text: '',
			textColor: 'black',
			left: 55,
			top: 0,
			maxWidth: Intro.MAX_WIDTH,
			zindex: Intro.ZID_STARTING + 2,
			opacity: 1,
		});

		// buttons at the right bottom (got to twitter and go to facebook)
		self.buttons.push(new EngineRect({
			fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_TWIT, PiratesApp.IMG_EXTENSION),
			width: 36,
			height: 37,
			top: Intro.BUTTON_Y+75,
			left: Intro.BUTTON_X,
			captureEvents: true,
			opacity: 0,
			zindex: Intro.ZID_STARTING+1,
			on: {
				mouseover: function() {

					self.setCursor(Intro.CURSOR_HOVER);

				},

				mouseleave: function() {

					self.setCursor(Intro.CURSOR_NORMAL);

				},

				mouseclick: function(){

					window.open("https://twitter.com/Solpeo_engine");

				}
			}
		}));

		self.buttons.push(new EngineRect({
			fill: PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_FB, PiratesApp.IMG_EXTENSION),
			width: 36,
			height: 37,
			top: Intro.BUTTON_Y+75,
			left: Intro.BUTTON_X + Intro.BUTTON_OFFSET,
			captureEvents: true,
			opacity: 0,
			zindex: Intro.ZID_STARTING+1,
			on: {
				mouseover: function() {

					self.setCursor(Intro.CURSOR_HOVER);

				},

				mouseleave: function() {

					self.setCursor(Intro.CURSOR_NORMAL);

				},

				mouseclick: function(){

					window.open("https://www.facebook.com/Solpeo");

				}
			}
		}));

		// pre-set time limit choice
		self.choice = 30;

		// set starting page of the intro
		self.setStartPage();

	}

	/** Constants: intro states. one state for each intro screen and one to determine if intro is active */

	/** @constant {Number} */
	Intro.STATE_START = 0;

	/** @constant {Number} */
	Intro.STATE_ABOUT = 1;

	/** @constant {Number} */
	Intro.STATE_INFO = 2;

	/** @constant {Number} */
	Intro.STATE_FINISH = 3;

	/** @constant {Number} */
	Intro.STATE_INACTIVE = 4;

	/** Constants: slots helpers. Used to ease acces to about and info buttons */
	/** @constant {Number} */
	Intro.SLOT_ABOUT = 2;

	/** @constant {Number} */
	Intro.SLOT_INFO = 3;

	/** Constants: max text width */
	/** @constant {Number} */
	Intro.MAX_WIDTH = 445;

	/** Constants: default game screen size */
	 /** @constant {Number} */
	Intro.WIDTH = 1367;
	/** @constant {Number} */
	Intro.HEIGHT = 769;

	/** Constants: cursor types used in intro */
	/** @constant {String} */
	Intro.CURSOR_NORMAL = 'default';

	/** @constant {String} */
	Intro.CURSOR_HOVER = 'pointer';

	/** Constants: zindex of intro element which is the lower one */
	/** @constant {Number} */
	Intro.ZID_STARTING = 0;

	/** Constants: twitter and facebook buttons positions */
	/** @constant {Number} */
	Intro.BUTTON_X = 280;

	/** @constant {Number} */
	Intro.BUTTON_Y = 215;

	/** @constant {Number} */
	Intro.BUTTON_OFFSET = 45;

	/** Constants: names of image files used in intro, later prefixed with PiratesApp.INTRO_PATH from config file */

	/** @constant {String} */
	Intro.IMG_BASE = 'intro';

	/** @constant {String} */
	Intro.IMG_BG = 'introbg';

	/** @constant {String} */
	Intro.IMG_START = 'intro_start';

	/** @constant {String} */
	Intro.IMG_INFO = 'intro_info';

	/** @constant {String} */
	Intro.IMG_ABOUT = 'intro_about';

	/** @constant {String} */
	Intro.IMG_FINISH = 'intro_finish';

	/** @constant {String} */
	Intro.IMG_X = 'intro_x';

	/** @constant {String} */
	Intro.IMG_BTN_ABOUT = 'about2';

	/** @constant {String} */
	Intro.IMG_BTN_INFO = 'info2';

	/** @constant {String} */
	Intro.IMG_BTN_DEMO = 'btn_demo';

	/** @constant {String} */
	Intro.IMG_BTN_PLAY = 'btn_play';

	Intro.IMG_BTN_ENGINE = 'btn_engine';

	/** @constant {String} */
	Intro.IMG_TWIT = 'twit';

	/** @constant {String} */
	Intro.IMG_FB = 'fb';

	Intro.IMG_MAP = 'map';
	Intro.IMG_LAYER = 'layer';
	Intro.IMG_PIRATE = 'pirate';
	Intro.IMG_COINS = 'coins';
	Intro.IMG_LOGO = 'logo';
	Intro.IMG_SKULL = 'skull';

	/** Constants: intro texts */
	/** @constant {String} */
	Intro.TEXT_INTRO = 'Y\'arr! Embark on a quest to conquer pieces of eight, a ship \ncarrying a rich bounty will pass close by soon! Do you think \nyou\'ve got what it takes to be a pirate? Argh!';

	/** @constant {String} */
	Intro.TEXT_ABOUT_1 = 'PIRATES is a tech demo mady by Solpeo. Our totally new HTML5 engine is going to make us rich! Oh, swashbuckles, did we say \nus? We really meant: \'ye\', it\'s going to make ye rich...';

	/** @constant {String} */
	Intro.TEXT_ABOUT_2 = 'Solpeo\'s HTML5 technology enables you to create a game once and run it instantly on all major current desktop and mobile \nplatforms. Check it out (and download it for free) on';

	/** @constant {String} */
	Intro.TEXT_ABOUT_3 = 'Any questions or comments please email contact@solpeo.com';

	/** @constant {String} */
	Intro.TEXT_INFO = 'Use your mouse, or tap the tokens if you\'re on a touch screen, \nto create vertical or horizontal combinations of at least  three\nsimilar tokens. ';

	Intro.property(/**@lends PiratesApp.Grid.prototype*/{

		/** Stores all neccesary images */
		images: null,

		/** Stores almost transparent overlays which are used to create text buttons */
		overlays: null,

		/** Stores all texts for the intro screens */
		texts: null,

		/** Used to create check boxes for time options */
		boxes: null,

		/** Array for Twitter and Facebook buttons at the bottom */
		buttons: null,

		/** Used to display title of each intro screen ('Pirates', 'about', 'instructions', etc) */
		title: null,

		/** Determines in which state intro is currently in */
		state: 0,

		/** Remembers which time option user has chosen */
		choice: 0,

		/** Set to true when game is ready to go to the main game screen */
		ready: false,

		/** Used for optimization. When true all assets from game screen are loaded, when false only put back on the scene */
		firstStart: true,

		/** handler for viewport. Used to change cursor when on active element */
		vPort: null

	});

	Intro.method({

		/**
		 * Sets cursor symbol
		 * @param {String} cursor
		 */
		setCursor: function(cursor){

			if (this.vPort != false) this.vPort.div.style.cursor = cursor;

		},

		/** Sets up and displays 'info' page */
		setInfoPage: function(){

			this.state = Intro.STATE_INFO;

			this.title.setText('instructions');
			this.title.setLeft(-75);

			this.texts[Intro.SLOT_ABOUT].setPosition(-90, 226);
			this.texts[Intro.SLOT_ABOUT].setText('DEMO GAME');
			this.texts[Intro.SLOT_INFO].setPosition(20, 226);
			this.texts[Intro.SLOT_INFO].setText('ABOUT');

			this.texts[0].setFont(new EngineFont({family:'Signika', size:'18px'}));
			this.texts[0].setText(Intro.TEXT_INFO);
			this.texts[0].setPosition(-215, -145);
			this.texts[1].setText('Go to game: ');
			this.texts[1].setPosition(-45, 90);

			this.texts[4].setOpacity(0);
			this.texts[5].setOpacity(0);
			this.texts[7].setOpacity(0);

			this.images[1].setOpacity(0);
			this.images[2].setOpacity(0);
			this.images[3].setOpacity(0);
			this.images[4].setOpacity(1);
			this.images[5].setOpacity(0);

			this.overlays[0].setLeft(-113);
			this.overlays[0].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_INFO, PiratesApp.IMG_EXTENSION));
			this.overlays[0].setSize(95, 20);
			this.overlays[0].setPosition(-92, 224);
			this.overlays[0].setOpacity(0.1);

			this.overlays[1].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_ABOUT, PiratesApp.IMG_EXTENSION));
			this.overlays[1].setSize(50, 20);
			this.overlays[1].setPosition(15, 224);
			this.overlays[1].setOpacity(0.1);

			this.overlays[2].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_DEMO, PiratesApp.IMG_EXTENSION));
			this.overlays[2].setPosition(-68, 116);
			this.overlays[2].setSize(128, 35);
			this.overlays[2].setOpacity(1);

			this.overlays[3].setOpacity(0);

			this.boxes[0].setOpacity(0);
			this.boxes[1].setOpacity(0);
			this.boxes[2].setOpacity(0);

			this.score.setOpacity(0);

		},

		/** Sets up and displays 'about' page */
		setAboutPage: function() {

			this.state = Intro.STATE_ABOUT;

			this.title.setLeft(-42);
			this.title.setText('about');

			this.texts[Intro.SLOT_ABOUT].setPosition(-108, 226);
			this.texts[Intro.SLOT_ABOUT].setText('DEMO GAME');
			this.texts[Intro.SLOT_INFO].setText('INSTRUCTIONS');
			this.texts[Intro.SLOT_INFO].setPosition(-8, 226);

			this.texts[0].setFont(new EngineFont({family:'Signika', size:'18px'}));
			this.texts[0].setText(Intro.TEXT_ABOUT_1);
			this.texts[0].setPosition(-215, -150);

			this.texts[1].setAlign(Engine.Geometry.Shape.Text.JUSTIFY);
			this.texts[1].setText(Intro.TEXT_ABOUT_2);
			this.texts[1].setPosition(-215, -80);

			this.texts[4].setOpacity(1);
			this.texts[5].setOpacity(1);
			this.texts[7].setOpacity(1);

			this.images[1].setOpacity(0);
			this.images[2].setOpacity(0);
			this.images[3].setOpacity(1);
			this.images[5].setOpacity(0);
			this.images[4].setOpacity(0);

			this.overlays[0].setLeft(-113);
			this.overlays[0].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_INFO, PiratesApp.IMG_EXTENSION));
			this.overlays[0].setSize(95, 20);

			this.overlays[1].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_INFO, PiratesApp.IMG_EXTENSION));
			this.overlays[1].setSize(95, 20);
			this.overlays[1].setPosition(-7, 224);
			this.overlays[1].setOpacity(0.1);

			this.overlays[2].setOpacity(0);
			this.overlays[3].setOpacity(0);

			this.boxes[0].setOpacity(0);
			this.boxes[1].setOpacity(0);
			this.boxes[2].setOpacity(0);

			this.score.setOpacity(0);

		},

		setFinishPage: function(score){

			this.state = Intro.STATE_FINISH;

			this.title.setLeft(-68);
			this.title.setText('game over');
			this.title.setOpacity(1);

			this.images[0].setOpacity(1);
			this.images[5].setOpacity(1);
			this.images[1].setOpacity(0);
			this.images[2].setOpacity(0);
			this.images[3].setOpacity(0);
			this.images[4].setOpacity(0);

			this.texts[0].setFont(new EngineFont({family:'Signika', size:'24px'}));
			this.texts[0].setText('YOUR SCORE: ');
			this.texts[0].setPosition(-80, 0);
			this.texts[0].setOpacity(1);
			this.score.setOpacity(1);
			this.score.setText(score);

			this.texts[1].setText('Try again or find out more about the Solpeo Engine:');
			this.texts[1].setOpacity(1);
			this.texts[1].setPosition(-176, 40);

			this.texts[2].setOpacity(0.4);
			this.texts[2].setText('ABOUT');
			this.texts[2].setPosition(-80, 226);
			this.texts[3].setOpacity(0.4);
			this.texts[3].setText('INSTRUCTIONS');
			this.texts[3].setPosition(-15, 226);

			this.texts[4].setOpacity(0);
			this.texts[5].setOpacity(0);
			this.texts[6].setOpacity(0.5);
			this.texts[7].setOpacity(0);

			this.overlays[0].setOpacity(0.1);
			this.overlays[1].setOpacity(0.1);
			this.overlays[2].setOpacity(1);
			this.overlays[2].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_DEMO, PiratesApp.IMG_EXTENSION));
			this.overlays[2].setPosition(-144, 96);
			this.overlays[2].setSize(128, 35);

			this.overlays[3].setOpacity(1);
			this.overlays[3].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_ENGINE, PiratesApp.IMG_EXTENSION));
			this.overlays[3].setPosition(12, 96);
			this.overlays[3].setSize(155, 35);

			this.boxes[0].setOpacity(0);
			this.boxes[1].setOpacity(0);
			this.boxes[2].setOpacity(0);

			this.buttons[0].setOpacity(1);
			this.buttons[1].setOpacity(1);

		},

		setStartPage: function(){

			this.state = Intro.STATE_START;

			this.title.setText('Pirates');
			this.title.setLeft(-50);

			this.images[0].setOpacity(1);
			this.images[1].setOpacity(1);
			this.images[2].setOpacity(1);
			this.images[3].setOpacity(0);
			this.images[4].setOpacity(0);
			this.images[5].setOpacity(0);

			this.texts[0].setOpacity(1);
			this.texts[0].setText(Intro.TEXT_INTRO);
			this.texts[0].setFont(new EngineFont({family:'Signika', size:'18px'}));
			this.texts[0].setAlign(Engine.Geometry.Shape.Text.JUSTIFY);
			this.texts[0].setPosition(-205, 0);

			this.texts[1].setOpacity(1);
			this.texts[1].setText('30 seconds            60 seconds           90 seconds');
			this.texts[1].setPosition(-152, 112);
			this.texts[1].setAlign(Engine.Geometry.Shape.Text.PRE);

			this.texts[2].setOpacity(0.4);
			this.texts[2].setText('ABOUT');
			this.texts[2].setPosition(-80, 226);
			this.texts[3].setOpacity(0.4);
			this.texts[3].setText('INSTRUCTIONS');
			this.texts[3].setPosition(-15, 226);

			this.texts[4].setOpacity(0);
			this.texts[5].setOpacity(0);
			this.texts[6].setOpacity(0.5);
			this.texts[7].setOpacity(0);

			this.overlays[0].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_ABOUT, PiratesApp.IMG_EXTENSION));
			this.overlays[0].setSize(50, 20);
			this.overlays[0].setPosition(-82, 224);
			this.overlays[0].setOpacity(0.1);

			this.overlays[1].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_INFO, PiratesApp.IMG_EXTENSION));
			this.overlays[1].setSize(95, 20);
			this.overlays[1].setPosition(-17, 224);
			this.overlays[1].setOpacity(0.1);

			this.overlays[2].setFill(PiratesApp.IMG_BASE.format(Intro.IMG_BASE, Intro.IMG_BTN_PLAY, PiratesApp.IMG_EXTENSION));
			this.overlays[2].setSize(78, 35);
			this.overlays[2].setPosition(-41, 146);
			this.overlays[2].setOpacity(1);

			this.overlays[3].setOpacity(0);
			this.overlays[3].setPosition(-41, -146);

			this.score.setOpacity(0);

			this.boxes[0].setOpacity(1);
			this.boxes[1].setOpacity(0.01);
			this.boxes[2].setOpacity(0.01);

			this.buttons[0].setOpacity(1);
			this.buttons[1].setOpacity(1);

			this.choice = 30;

		},

		/**
		 * Starts a game by setting flags and then execution happens in main loop in main file
		 */
		startGame: function(){

			this.ready = true;
			this.state = Intro.STATE_INACTIVE;

		},

		/**
		 * Removes elements from scene so they won't conflict with elements added later (main game screen)
		 * @param {Engine.Scene} scene Scene from which to remove elements
		 */
		removeFromScene: function(scene){

			for (i = 0; i < this.images.length; i++)
				scene.removeChild(this.images[i]);

			for (i = 0; i < this.boxes.length; i++)
				scene.removeChild(this.boxes[i]);

			for (i = 0; i < this.overlays.length; i++)
				scene.removeChild(this.overlays[i]);

			for (i = 0; i < this.texts.length; i++)
				scene.removeChild(this.texts[i]);

			for (i = 0; i < this.buttons.length; i++)
				scene.removeChild(this.buttons[i]);

			scene.removeChild(this.title);
			scene.removeChild(this.score);

		},

		/**
		 * Append intro elements to selected scene
		 * @param {Object} scene
		 */
		appendTo: function(scene) {

			for (i = 0; i < this.images.length; i++)
				scene.appendChild(this.images[i]);

			for (i = 0; i < this.overlays.length; i++)
				scene.appendChild(this.overlays[i]);

			for (i = 0; i < this.boxes.length; i++)
				scene.appendChild(this.boxes[i]);

			for (i = 0; i < this.texts.length; i++)
				scene.appendChild(this.texts[i]);

			for (i = 0; i < this.buttons.length; i++)
				scene.appendChild(this.buttons[i]);

			scene.appendChild(this.title);
			scene.appendChild(this.score);

		}

	});

	return Intro;

})(Engine.Geometry.Rectangle, Engine.Font)
