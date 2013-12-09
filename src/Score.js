PiratesApp.Score = (function(){

	/**
	 * Score class is used to store and display player's score on the screen.
	 *
	 * @constructor
	 * @property {Number} currentScore How many point player has earned until now
	 * @property {Object} score Text Engine.Geometry.Shape.Text object used to dispaly score
	 */
	function Score(){

		this.scoreText = new Engine.Geometry.Shape.Text({
			font: new Engine.Font({family:'RobotoSlab', size:'16px'}),
			text: '',
			textColor: 'white',
		});

		this.scoreText.setTextAlign(Engine.Geometry.Shape.Text.RIGHT);
		this.scoreText.setPosition(Score.START_X, Score.START_Y);

		this.currentScore = 0;

	}

	/** Constants describing positions on the screen */
	/** @constant {Number} */
	Score.START_X = -120;
	/** @constant {Number} */
	Score.START_Y = -248;
	/** @constant {Number} */
	Score.OFFSET_X = 50;
	/** @constant {Number} */
	Score.WIDTH = 50;
	/** @constant {Number} */
	Score.HEIGHT = 50;

	/** Constants determining scoring behaviour. */
	/** @constant {Number} */
	Score.MATCH_3 = 3;
	/** @constant {Number} */
	Score.MATCH_4 = 5;
	/** @constant {Number} */
	Score.MATCH_5 = 10;
	/** @constant {Number} */
	Score.MATCH_6 = 20;
	/** @constant {Number} */
	Score.MATCH_MORE = 50;

	Score.property(/**@lends PiratesApp.Grid.prototype*/{

		/** {Number} How many points player has earned until current moment */
		currentScore: 0,

		/** {Object}  object used to dispaly score */
		scoreText: null

	});

	Score.method({

		/**
		 * @param {Number} score Increase current score by this value
		 */
		addScore: function(score){

			if(score < 4) this.currentScore += Score.MATCH_3;
			else if (score < 5)	this.currentScore += Score.MATCH_4;
			else if (score < 6)	this.currentScore += Score.MATCH_5;
			else if (score < 7)	this.currentScore += Score.MATCH_6;
			else this.currentScore += Score.MATCH_MORE;

		},

		/**
		 * @param {Number} score Current score value to be set and displayed
		 */
		setScore: function(score){

			this.scoreText.setText('' + score);
			this.currentScore = score;

		},

		/**
		 * @param {Engine.Scene} scene Determines to which scene this Score object will be appended
		 */
		 appendTo: function(scene){

			 scene.appendChild(this.scoreText);

		 },

		/**
		 * Removes elements from scene so they won't conflict with elements added later (main game screen)
		 * @param {Engine.Scene} scene Scene from which to remove elements
		 */
		removeFromScene: function(scene){

			scene.removeChild(this.scoreText);

		}

	});

	return Score;

})()
