PiratesApp.Sound = (function(){

	/**
	 * Sound namespace used to handle sounds and music in the game.
	 */
	var SND_PATH = 'sounds/';

	var refillCounter = 0;

	var soundsOn = true;
	var musicOn = true;

	var soundsDB = [
		'cntdwn',
		'refill1',
		'refill1',
		'refill1',
		'swap1',
		'destroy',
	]

	sounds = [];

	function Sound(){};

	Sound.prepareSounds = function(){

		for (var i = 0; i < soundsDB.length; i++)
			sounds.push(new Engine.Sound({
				src: SND_PATH + soundsDB[i],
				})
			);

		sounds.push(new Engine.Sound({
			src: SND_PATH + 'music',
			loop: true,
			on: {
				loaded: function(){

					this.play();

				}
			}
		}));
	}

	Sound.SND_COUNTDOWN = 0;
	Sound.SND_REFILL_1 = 1;
	Sound.ND_REFILL_2 = 2;
	Sound.SND_REFILL_3 = 3;
	Sound.SND_SWAP = 4;
	Sound.SND_DESTROY = 5;
	Sound.SND_MUSIC = 6;

	Sound.playSound =  function(sound){

		if (sound === Sound.SND_MUSIC)
		{
			sounds[sound].play();
			return;
		}

		if (soundsOn) sounds[sound].play();

	};

	Sound.stopSound = function(sound){

		sounds[sound].stop();

	};

	Sound.toggleSound = function(){

		soundsOn = !soundsOn;

	};

	Sound.toggleMusic = function(){

		musicOn = !musicOn;
		if (musicOn) Sound.playSound(Sound.SND_MUSIC);
		else Sound.stopSound(Sound.SND_MUSIC);

	};

	Sound.playRefillSound = function(){

		Sound.playSound(Sound.SND_REFILL_1 + refillCounter);
		if (++refillCounter === 3) refillCounter = 0;

	};

	return Sound;

})();
