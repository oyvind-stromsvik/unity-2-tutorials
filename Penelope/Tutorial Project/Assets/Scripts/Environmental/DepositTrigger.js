//	DepositTrigger.js
//	This script will active the particle effects for the DepositArea and deposit the carried items
//	Attach to DepositArea

#pragma strict

//	Exposed Variables
var emitters : ParticleEmitter[];
var depository : GameObject;

//	Basic Game Variables
private var arrowShown = false;



//	STANDARD FUNCTIONS

function Start () {
	for (var emitter in emitters) 
		emitter.emit = false;
	DeactivateDepository ();
	for (var child : Transform in transform) 
		child.gameObject.SetActiveRecursively (false);
}


function OnTriggerEnter (other : Collider) {
	ActivateDepository ();
	for (var emitter in emitters)
		emitter.emit = true;
	other.SendMessage ("Deposit");
	if (!arrowShown) {
		for (var child : Transform in transform) 
			Destroy (child.gameObject);
			arrowShown = true;
	}
}


function OnTriggerExit (other : Collider) {
	for (var emitter in emitters) 
		emitter.emit = false;
	DeactivateDepository ();
}


//	MY FUNCTIONS

function DeactivateDepository () {
	depository.SendMessage ("FadeOut");
}


function ActivateDepository () {
	if (!arrowShown) 
		gameObject.SetActiveRecursively (true);
	depository.SendMessage ("FadeIn");
}



// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission