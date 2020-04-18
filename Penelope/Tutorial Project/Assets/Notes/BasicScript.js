//	ScriptName.js
//	Description
//	Use

#pragma strict

//	@script RequireComponent(SomeComponent eg: GUITexture)

// enum SomeCategory {SomeSpecific, SomeOtherSpecific} 

//	BASIC VARIABLES
//	Game Objects and Components

//	Instances of Helper Classes

//	Exposed Variables

//	Basic Game Variables

//	Cached Link Variables


//	HELPER CLASSES
//	Sound Effects
//class SoundEffects {
//	var clip : AudioClip;
//	var volume : float = 1.0;
//	var loop = false;
//	var pitchVariation : float = 0.0;
//}

//	HELPER FUNCTIONS
//	Singleton Support
//	Check with the wiki, as there are other ways to do this, but this seems the easiest for Unity.js.
//	Check with the platformer tutorial as well, as they have singleton support there.
//	Requires calls like: BasicScript.Instance().SomeFunction ();

//static function Instance () {
//	if (!instance) {
//		instance = FindObjectOfType (ScriptName);
//		if (!instance)
//			Debug.LogError ("There needs to be one active GameController script on a GameObject in your scene.");
//	}
//	return instance;
//}



//	STANDARD FUNCTIONS

function Awake () {
	
}


function Start () {
	
}


function OnEnable () {
	
}


function FixedUpdate () {
	
}


function Update () {
	
}


function OnCollisionEnter () {
	
}


function OnTriggerEnter () {
	
}

function OnDisable () {
	
}



//	MY FUNCTIONS

//function SomeFunction () {
//	
//}

function GetRandomNumber (randomRange : float) {
	InitRandomSeed ();
	var target = randomRange - 1;
	var randomNumber = Mathf.Clamp((Random.value * target) + 1, 1.0, randomRange);
	return randomNumber;
}


function InitRandomSeed () {
	if (iPhoneInput.acceleration.x) {
		Random.seed = iPhoneInput.acceleration.x * Random.seed;
	}
	else {
		var ticks : String = System.DateTime.Now.Ticks.ToString ();
		Random.seed = parseInt (ticks.Substring(ticks.length - 8, 8));
	}
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission