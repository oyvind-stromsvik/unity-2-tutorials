//	LaunchIntro.js
//	Controls the camera shake, sounds and Starts the Game
//	Attach to a appropriate CameraObject

#pragma strict

//	BASIC VARIABLES

//	Exposed Variables
var spawnParticleEmitter : ParticleEmitter;
var rumbleSound : AudioClip;
var boomSound : AudioClip;

//	Basic Game Variables
private var thisTransform : Transform;
private var thisAudio : AudioSource;


//	STANDARD FUNCTIONS

function Start () {
	thisTransform = transform;
	thisAudio = audio;
	thisAudio.PlayOneShot (rumbleSound, 1.0);
	InvokeRepeating ("CameraShake", 0, 0.05);
	Invoke ("Launch", rumbleSound.length);
}


//	MY FUNCTIONS

function CameraShake () {
	var eulerAngles = Vector3 (Random.Range (0, 5), Random.Range (0, 5), 0);
	thisTransform.localEulerAngles = eulerAngles;
}


function Launch () {
	spawnParticleEmitter.emit = true; 
	thisAudio.PlayOneShot (boomSound, 1.0);
	Invoke ("CancelInvoke", 0.5);
} 


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission