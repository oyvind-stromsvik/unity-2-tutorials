//	ScoreKeeper.js
//	Keeps track of the player’s score, both the deposited and carried point count, and the time remaining
//	Use

#pragma strict

//	BASIC VARIABLES
//	Exposed Variables
var carrying : int;
var carryLimit : int;
var deposited : int;
var winScore : int;
var gameLength : int;
var guiMessage : GameObject;
var carryingGui : GUIText;
var depositedGui : GUIText;
var timerGui : GUIText;

var collectSounds : AudioClip[];
var winSound : AudioClip;
var loseSound : AudioClip;
var pickupSound : AudioClip;
var depositSound : AudioClip;

//	Basic Game Variables
private var timeSinceLastPlay : float;
private var timeLeft : float;



//	STANDARD FUNCTIONS

function Start () {
	timeLeft = gameLength;
	timeSinceLastPlay = Time.time;
	UpdateCarryingGui ();
	UpdateDepositedGui ();
	CheckTime ();
}


//	MY FUNCTIONS

function UpdateCarryingGui () {
	carryingGui.text = "";
//	carryingGui.text = "Carrying: " + carrying + " of " + carryLimit;
}


function UpdateDepositedGui () {
	depositedGui.text = "";
//	depositedGui.text = "Deposited: " + deposited + " of " + winScore;
}


function UpdateTimerGui () {
	timerGui.text = "Time: " + TimeRemaining ();
}


private function CheckTime () {
	while (timeLeft > 0) {
		UpdateTimerGui ();
		yield WaitForSeconds (1);
		timeLeft -= 1;
	}
	UpdateTimerGui ();
	EndGame ();
}


function PlayAudioClip (clip : AudioClip, position : Vector3, volume : float) {
	var go = new GameObject ("One shot audio");
	go.transform.position = position;
	var source : AudioSource = go.AddComponent (AudioSource);
	source.rolloffFactor = 0;
	source.clip = clip;
	source.volume = volume;
	source.Play ();
	Destroy (go, clip.length);
	return source;
}


function Win () {
	deposited = winScore * 2;
}

function EndGame () {
	var animationController : AnimationController = GetComponent (AnimationController);
	var Prefab : GameObject = Instantiate (guiMessage);
	var endMessage : GUIText = Prefab.GetComponent (GUIText);

	if (deposited >= winScore) {
		endMessage.text = "You win!";
		PlayAudioClip (winSound, Vector3.zero, 1.0);
		animationController.animationTarget.Play ("WIN");

	}else {
		endMessage.text = "Oh no...You lose!";
		PlayAudioClip (loseSound, Vector3.zero, 1.0);
		animationController.animationTarget.Play ("LOSE");
	}

	SendMessage ("OnEndGame");
	while (true) {
	 yield WaitForFixedUpdate ();
	 if (iPhoneInput.touchCount > 0 && iPhoneInput.GetTouch (0).phase == iPhoneTouchPhase.Began) 
		break;
	}
	
	Application.LoadLevel ("FRPControl");
//	Application.LoadLevel (0);
}


public function Pickup (pickup : ParticlePickup) {
	if (carrying < carryLimit) {
		carrying++;
	 UpdateCarryingGui ();
	 var minTimeBetweenPlays = 5;
	 if (Random.value < 0.1 && Time.time > (minTimeBetweenPlays + timeSinceLastPlay)){
		PlayAudioClip (collectSounds[ Random.Range (0, collectSounds.length)], 
		 Vector3.zero, 0.25);
		timeSinceLastPlay = Time.time;
	 }
	pickup.Collected ();
	PlayAudioClip (pickupSound, pickup.transform.position, 1.0);
	}else {
		var warning : GameObject = Instantiate (guiMessage);
		warning.guiText.text = "You can’t carry any more";
		Destroy (warning, 2);
	}
	if (carrying >= carryLimit) 
		pickup.emitter.SendMessage ("ActivateDepository");
}


public function Deposit () {
	deposited += carrying;
	carrying = 0;
	UpdateCarryingGui ();
	UpdateDepositedGui ();
	PlayAudioClip (depositSound, transform.position, 1.0);
}


public function TimeRemaining () : String {
	var remaining : int = timeLeft;
	var val : String;
	if (remaining > 59) 
		val+= remaining / 60 + ".";
	if (remaining >= 0) {
		var seconds : String = (remaining % 60).ToString ();
		if (seconds.length < 2) 
			val += "0" + seconds;
		else 
			val += seconds;
		}
	return val;
}



// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission