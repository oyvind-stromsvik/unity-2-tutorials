//	AnimationSpeed.js
//	Allows us to adjust the speed of cameraAnimation’s playback
//	Attach to the CameraObject

#pragma strict

var animationTarget : Animation;
var speed = 1.0;

function Start() {
	animationTarget[animationTarget.clip.name].speed = speed;
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission