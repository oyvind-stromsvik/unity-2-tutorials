//	FollowTransform.js
//	Match the transform of the GameObject to which it is attached to a second object selected in the Inspector.
//	Attach to a following GameObject

#pragma strict

//	Exposed Variables
var targetTransform : Transform; 
var faceForward : boolean = false; 

//	Basic Game Variables
private var thisTransform : Transform; 


//	STANDARD FUNCTIONS

function Start() {
	thisTransform = transform;
}


function Update () {
	thisTransform.position = targetTransform.position; 
	if (faceForward) 
		thisTransform.forward = targetTransform.forward;
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission