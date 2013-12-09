Engine.ready(function(){

	var SCENE_LEFT = -265,
	    SCENE_TOP = -285,
	    SCENE_WIDTH = 530,
	    SCENE_HEIGHT = 570,

	    VIEW_DELTA = 0,

	    VIEW_LEFT = SCENE_LEFT - VIEW_DELTA,
	    VIEW_TOP = SCENE_TOP - VIEW_DELTA,
	    VIEW_WIDTH = SCENE_WIDTH + VIEW_DELTA * 2,
	    VIEW_HEIGHT = SCENE_HEIGHT + VIEW_DELTA;

	// create scene
	var sceneMain = new Engine.Scene({});

	// create viewport
	var viewport = new Engine.Viewport({
		background: 'transparent',
		id: 'engine',
	});

	// create a root node
	var layout;
	new Engine.UI.Layout({
		parent: sceneMain,
		fill: camera,
		children: [
			layout = new Engine.Node.Transform.Anchor({
				anchors: {
					centerin: 'parent'
				}
			})
		]
	});

	new Engine.UI.Box({
		parent: layout,
		name: 'wall',
		image: PiratesApp.INTRO_PATH + 'introbg.png)',
		width: 1921,
		height: 1081,
		captureEvents: false,
		opacity: 1,
		anchors: {
			centerin: 'parent'
		}
	});

	// create camera
	var camera = new Engine.Camera({
		scrollable: false
	});

	// add camera to viewport
	viewport.addCamera(camera);

	// look at this scene with camera
	camera.lookAt(sceneMain);

	Engine.Device.on('resize', function(){

		timer.trigger('scale');

	});

	// add timer
	var timer = new Engine.Timer({
		delay: 15,
		type: Engine.Timer.VSYNC,
		autoplay: true,
		loop: true,
		on: {

			scale: function(){

				var screen_width = Engine.Device.screen.innerWidth;
				var screen_height = Engine.Device.screen.innerHeight;

				var scale = screen_width / VIEW_WIDTH;
				if (scale > screen_height / VIEW_HEIGHT) scale = screen_height / VIEW_HEIGHT;

				camera.set('zoom', Math.min(scale,1));

			},

			step: function(){

				// first start of the game
				if(mainIntro.ready && mainIntro.firstStart){

					camera.moveBy(0, 35);

					mainIntro.ready = false;
					mainIntro.firstStart = false;
					mainIntro.removeFromScene(sceneMain);

					option = Math.floor ( Math.random() * 6 );

					mainGrid.appendTo(sceneMain);
					mainGrid.show();

					mainScore.appendTo(sceneMain);
					mainScore.setScore(0);

					mainTimer.appendTo(sceneMain);
					mainTimer.setTime(mainIntro.choice);
					mainTimer.startCountdown(3);

				}

				else if(mainIntro.ready && !mainIntro.firstStart){

					camera.moveBy(0, 35);
					mainIntro.ready = false;
					mainIntro.removeFromScene(sceneMain);

					option = Math.floor ( Math.random() * 6 );
					mainGrid.reloadGrid(option);
					mainGrid.addToScene(sceneMain);
					mainGrid.ready = false;

					mainScore.appendTo(sceneMain);
					mainScore.setScore(0);

					mainTimer.appendTo(sceneMain);
					mainTimer.setTime(mainIntro.choice);
					mainTimer.startCountdown(3);

				}

				// reload the menu after playing the game at least once
				else if (mainGrid.backToIntro){

					mainGrid.backToIntro = false;
					mainIntro.state = mainIntro.STATE_START;
					mainIntro.show();

				}

				// main game animations and calculations
				if (mainGrid.animate.swap) mainGrid.performSwap();
				if (mainGrid.animate.drop)	mainGrid.performDrop();
				if (mainGrid.animate.dropRefiller) mainGrid.dropRefiller();

				// after drop - update grid
				if(!mainGrid.animate.drop && !mainGrid.animate.dropRefiller && mainGrid.doCheck) {

					mainGrid.doCheck = false;
					mainGrid.updateData();

				}

				// what happens when time runs out
				if(mainTimer.finish && mainGrid.ready) {

					camera.moveBy(0, -35);

					mainTimer.finish = false;
					mainTimer.tick = false;

					mainGrid.removeFromScene(sceneMain);
					mainGrid.state = mainGrid.STATE_FINISH;

					mainTimer.removeFromScene(sceneMain);
					mainScore.removeFromScene(sceneMain);

					mainIntro.appendTo(sceneMain);
					mainIntro.setFinishPage(mainScore.currentScore);

				}

			}
		}
	});

	// timer for timer
	var timer_2 = new Engine.Timer({
		duration: Infinity,
		delay: 1000,
		type: Engine.Timer.VSYNC,
		autoplay: true,
		loop: true,
		on: {
			step: function(){

				if (mainTimer.countdown.tick) mainTimer.performCountdown();
				else if (mainTimer.tick) mainTimer.decrease();

				if (mainTimer.readyGrid) {

					mainTimer.readyGrid = false;
					mainGrid.ready = true;

				}

			}
		}
	});

	// game related stuff
	var option = Math.floor ( Math.random() * 6 );

	var mainGrid = new PiratesApp.Grid(option);
	var mainIntro = new PiratesApp.Intro();
	var mainScore = new PiratesApp.Score();
	var mainTimer = new PiratesApp.Timer();

	mainGrid.sceneHandler = sceneMain;
	mainGrid.scoreHandler = mainScore;
	mainGrid.vPort = viewport;

	mainIntro.vPort = viewport;
	mainIntro.appendTo(sceneMain);

	mainTimer.grid = mainGrid;

	PiratesApp.Sound.prepareSounds();

});
