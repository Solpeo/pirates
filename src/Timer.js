PiratesApp.Timer = (function(){

	/**
	 * Timer class is used to count and display on the screen time left till the end of round.
	 * Also it is used to display countdown at the begining of the round.
	 *
	 * @constructor
	 */
	function Timer(){

		this.currentTime = 0;
		this.tick = false;
		this.finish = false;
		this.readyGrid = false;

		this.timerText = new Engine.Geometry.Shape.Text({
			font: new Engine.Font({family:'BerkshireSwash', size:'16px'}),
			text: '',
			textColor: 'white',
			left: 112,
			top: -244,
		});

		this.countdown = {
			digit: new Engine.Geometry.Rectangle({
				fill:	'image(images/no_3.png)',
				width: Timer.WIDTH,
				height: Timer.HEIGHT,
				top:  Timer.START_Y + Timer.OFFSET_X*5,
				left: -Timer.WIDTH / 2,
				opacity: 1,
				zindex: 3,
			}),
			value: 0,
			wait:  0,
			tick:  false
		};

	}

	/** Constants describing display positions */
	/** @constant {Number} */
	Timer.START_X = -260;
	/** @constant {Number} */
	Timer.START_Y = -260;
	/** @constant {Number} */
	Timer.WIDTH = 180;
	/** @constant {Number} */
	Timer.HEIGHT = 180;
	/** @constant {Number} */
	Timer.OFFSET_X = 50;

	/** Constants determining where to look for images */
	/** @constante {String} */
	Timer.IMG_BASE = '';

	/** @constante {String} */
	Timer.IMG_START = 'start';

	Timer.property(/**@lends PiratesApp.Grid.prototype*/{

		/** Time left till the end of round / game */
		currentTime: 0,

		/** Determines if timer should work */
		tick: false,

		/** Set to true when time runs out */
		finish: false,

		/** Determines when grid may be set to be available again (after countdown) */
		readyGrid: false,

		/** Stores Engine.Geometry.Rectangle objects which display time on screen */
		timerText: null,

		/** Stores data and image for count down */
		countdown: null

	});

	Timer.method({

		/**
		* Starts countdown at the begining of the stage
		* @param {Number} count Determines how many time units (ex. seconds) to count down
		* @param {Number} [wait] Determines for how long to wait before count down starts
		*/
		startCountdown: function(count, wait){

			if (!wait) this.countdown.wait = 1;
			else this.countdown.wait = wait;

			this.tick = false;
			this.readyGrid = false;
			this.countdown.tick = true;
			this.countdown.value = count + 1;
			this.countdown.digit.setOpacity(1);
			this.countdown.digit.setFill('image(images/no_' + count + '.png)');

		},

		/**
		* Fired at each timer tick, decreases count down counter and sets grid.ready to true,
		* so player can start the game
		*/
		performCountdown: function(){

			this.finish = false;

			if (this.countdown.wait > 0) this.countdown.wait--;
			else {

				if (this.countdown.value > 0) {

					this.countdown.value--;

					if (this.countdown.value === 1) {

						this.countdown.digit.setFill(PiratesApp.IMG_BASE.format(Timer.IMG_BASE, Timer.IMG_START, PiratesApp.IMG_EXTENSION));
						this.countdown.digit.update();

						this.readyGrid = true;
						return;

					} else if (this.countdown.value === 0) return;

					this.countdown.digit.setFill(PiratesApp.IMG_BASE.format(Timer.IMG_BASE, 'no_'+ (this.countdown.value-1), PiratesApp.IMG_EXTENSION));

				} else {

					this.tick = true;
					this.countdown.tick = false;
					this.countdown.digit.opacity = 0;
					this.countdown.digit.update();

				}

			}

		},

		/**
		* @param {Number} time Set current time to this value and display it
		*/
		setTime: function(time){

			this.currentTime = time;
			this.timerText.setText('' + time);
			this.tick = true;

		},

		/**
		* Decrease time at tick
		*/
		decrease: function(){

			this.currentTime--;

			if (this.currentTime === 9) PiratesApp.Sound.playSound(PiratesApp.Sound.SND_COUNTDOWN);

			if (this.currentTime < 0) {

				this.finish = true;
				return;

			}

			this.timerText.setText('' + this.currentTime);

		},

		/**
		* @param {Object} scene Determines to which scene this Score object will be appended
		*/
		appendTo: function(scene){

			scene.appendChild(this.timerText);
			scene.appendChild(this.countdown.digit);

		},

		removeFromScene: function(scene){

			scene.removeChild(this.timerText);
			scene.removeChild(this.countdown.digit);

		}

	});

	return Timer;

})()
