/*
	* jquery.timer.js
	* Copyright (c) 2011 Jason Chavannes <jason.chavannes@gmail.com>
	* http://jchavannes.com/jquery-timer
*/

;(function($) {
	$.timer = function(func, time, autostart) {
	 	this.set = function(func, time, autostart) {
	 		this.init = true;
	 	 	if(typeof func == 'object') {
		 	 	var paramList = ['autostart', 'time'];
	 	 	 	for(var arg in paramList) {
					if(func[paramList[arg]] != undefined) {eval(paramList[arg] + " = func[paramList[arg]]");}
				};
 	 			func = func.action;
	 	 	}
	 	 	if(typeof func == 'function') {this.action = func;}
		 	if(!isNaN(time)) {this.intervalTime = time;}
		 	if(autostart && !this.isActive) {
			 	this.isActive = true;
			 	this.setTimer();
		 	}
		 	return this;
	 	};
	 	this.once = function(time) {
			var timer = this;
	 	 	if(isNaN(time)) {time = 0;}
			window.setTimeout(function() {timer.action();}, time);
	 		return this;
	 	};
		this.play = function(reset) {
			if(!this.isActive) {
				if(reset) {this.setTimer();}
				else {this.setTimer(this.remaining);}
				this.isActive = true;
			}
			return this;
		};
		this.pause = function() {
			if(this.isActive) {
				this.isActive = false;
				this.remaining -= new Date() - this.last;
				this.clearTimer();
			}
			return this;
		};
		this.stop = function() {
			this.isActive = false;
			this.remaining = this.intervalTime;
			this.clearTimer();
			return this;
		};
		this.toggle = function(reset) {
			if(this.isActive) {this.pause();}
			else if(reset) {this.play(true);}
			else {this.play();}
			return this;
		};
		this.reset = function() {
			this.isActive = false;
			this.play(true);
			return this;
		};
		this.clearTimer = function() {
			window.clearTimeout(this.timeoutObject);
		};
	 	this.setTimer = function(time) {
			var timer = this;
	 	 	if(typeof this.action != 'function') {return;}
	 	 	if(isNaN(time)) {time = this.intervalTime;}
		 	this.remaining = time;
	 	 	this.last = new Date();
			this.clearTimer();
			this.timeoutObject = window.setTimeout(function() {timer.go();}, time);
		};
	 	this.go = function() {
	 		if(this.isActive) {
	 			this.action();
	 			this.setTimer();
	 		}
	 	};

	 	if(this.init) {
	 		return new $.timer(func, time, autostart);
	 	} else {
			this.set(func, time, autostart);
	 		return this;
	 	}
	};
})(jQuery);

var pomodoroTimer = new (function() {
    var countdown, mode = 0, isRunning = false,
		timeFocus = 150000, timeIncrements = 1000, timeNow = 0,
		audio, audioLoad = false, audioPlay = true, tomatoAnimation = true,
		updateSettings = true, previousState = "";

        updateTimer = function() {
            countdown.html(formatTime(timeNow));
            if(timeNow <= 0) {
				timeNow = 0; return skipTimer();
			}
            timeNow -= timeIncrements / 10;
        }
//CHANGE REST / FOCUS AT THE TOP
		updateStatus = function(status) {
			$("#status").html((status) ? status : (mode == 0) ? "Focus" : "FOCUS");
		}
// SWITCHES MODE, CALLS AUDIO FUNCTION
		switchTimer = function() {
			if(!mode) {
				mode = 1; timeNow = timeFocus;
			} else {
				mode = 0; timeNow = timeFocus;
			}
			updateStatus(false);
			audioNotification();
		}
//SKIP FUNCTION
		skipTimer = function() {
			switchTimer();
			resetCountdown(false);
		}

		updateTimerSettings = function() {
			audioPlay = $("#notificationaudio")[0].checked;
			timeFocus = Number($("#focusLength").val()) * 6000;
			tomatoAnimation = $("#animationswitch")[0].checked;

			if(tomatoAnimation) animation(true); else animation();

			if(!isRunning) resetCountdown(true);
		}
//SOUNDS
		audioNotification = function() {
			if(!audioLoad) {
				audio = $("<audio>").attr("src", "notification.mp3");
				audioLoad = true;
			}
			if(audioPlay) audio[0].play();
		}
//TRANSITION ANIMATION(SETTINGS)
		animation = function(show) {
			$("#animation").css("opacity", 0);
			if(tomatoAnimation) {
				$("#animation").animate({
					opacity: (show) ? 1 : 0
				}, 300);
			}
		}

        init = function() {
			countdown = $("#countdown");
			timeNow = timeFocus;

			$("#pnp").on("click", function() {
				isRunning = (isRunning) ? false : true;
				updateStatus(false);
				$(".play-button").toggleClass("paused-button");
				pomodoroTimer.Timer.toggle();
				animation(isRunning);
			});

			$("#rs").on("click", function() {
				isRunning = false;
				updateStatus("Welcome");
				resetCountdown(true);
				$(".play-button").addClass("paused-button");
				animation(isRunning);
			});

			$("#skip").on("click", function() {
				isRunning = true;
				skipTimer();
				$(".play-button").removeClass("paused-button");
				animation(isRunning);
			});

			$("#settingsbtn").on("click", function() {
				updateSettings = (updateSettings) ? false : true;
				if(updateSettings) updateTimerSettings();
				$("#settings").fadeToggle(500);
			});

            pomodoroTimer.Timer = $.timer(updateTimer, timeIncrements, false);
		}

	    resetCountdown = function(reset) {
			pomodoroTimer.Timer.stop().once();
			if(reset) {
				mode = 0; timeNow = timeFocus;
			} else {
				pomodoroTimer.Timer.toggle();
			}
		}

    $(init);
});
// FORMAT TIME
function pad(number, length) {
    var str = '' + number;
    while(str.length < length) {str = '0' + str;}
    return str;
}
// FORMAT TIME
function formatTime(time) {
	var min = parseInt(time / 6000),
        sec = parseInt(time / 100) - (min * 60),
        hundredths = pad(time - (sec * 100) - (min * 6000), 2);
	return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2);
}
