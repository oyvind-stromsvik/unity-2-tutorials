//	AnimationController.js
//	This script plays the appropriate animations for a character and controls the blending between them
//	Attatch to the Player Object

#pragma strict

//	BASIC VARIABLES
//	Game Objects and Components

//	Instances of Helper Classes

//	Exposed Variables
var animationTarget : Animation;
var maxForwardSpeed : float = 6;
var maxBackwardSpeed : float = 3;
var maxSidestepSpeed : float = 4;

//	Basic Game Variables
private var character : CharacterController;
private var thisTransform : Transform;
private var jumping : boolean = false;
private var minUpwardSpeed = 2;



//	STANDARD FUNCTIONS

function Start () {
	character = GetComponent (CharacterController);
	thisTransform = transform;

	animationTarget.wrapMode = WrapMode.Loop;
	animationTarget["jump"].wrapMode = WrapMode.ClampForever;
	animationTarget["jump-land"].wrapMode = WrapMode.ClampForever;
	animationTarget["run-land"].wrapMode = WrapMode.ClampForever;
	animationTarget["LOSE"].wrapMode = WrapMode.ClampForever;
}


function Update () {			
	var characterVelocity = character.velocity;
	
	// When monitoring movement we check horizontal and vertical movement 
	// separately to decide what animations to play.
	var horizontalVelocity : Vector3 = characterVelocity;
	horizontalVelocity.y = 0; // ignore any vertical movement
	var speed = horizontalVelocity.magnitude;

	var upwardsMotion = Vector3.Dot (thisTransform.up, characterVelocity);
	
	if (!character.isGrounded && upwardsMotion > minUpwardSpeed)
		jumping = true;
	
	if (animationTarget.IsPlaying ("run-land") && animationTarget["run-land"].normalizedTime < 1.0 && speed > 0) {
		// Let this animation finish
	}
	else if (animationTarget.IsPlaying ("jump-land")) {
		// Let this animations finish
		if (animationTarget["jump-land"].normalizedTime >= 1.0)
			// when the animation is done playing, go back to idle
			animationTarget.Play ("idle");		
	}
	else if (jumping) {
		if (character.isGrounded) {
			// play the appropriate animation for landing depending on
			// whether we are landing while running or jumping in-place 
			if (speed > 0)
				animationTarget.Play ("run-land");
			else	
				animationTarget.Play ("jump-land");
			jumping = false;				
		}
		else
			animationTarget.Play ("jump");
	}
	else if (speed > 0) {
		var forwardMotion = Vector3.Dot (thisTransform.forward, horizontalVelocity);
		var sidewaysMotion = Vector3.Dot (thisTransform.right, horizontalVelocity);
		var t = 0.0;
		
		// Use the largest movement direction to determine which animations to play
		if (Mathf.Abs (forwardMotion) > Mathf.Abs (sidewaysMotion)) {
			if (forwardMotion > 0) {
				// Adjust the animation speed to match with how fast the
				// character is moving forward
				t = Mathf.Clamp (Mathf.Abs (speed / maxForwardSpeed), 0, maxForwardSpeed);
				animationTarget["run"].speed = Mathf.Lerp (0.25, 1, t);
										
				if (animationTarget.IsPlaying ("run-land") || animationTarget.IsPlaying ("idle"))
					// Don't blend coming from a land, just play
					animationTarget.Play ("run"); 
				else
					animationTarget.CrossFade ("run");
			}
			else {
				// Adjust the animation speed to match with how fast the
				// character is moving backward
				t = Mathf.Clamp (Mathf.Abs (speed / maxBackwardSpeed), 0, maxBackwardSpeed);
				
				animationTarget["runback"].speed = Mathf.Lerp (0.25, 1, t);
				animationTarget.CrossFade ("runback");			
			}
		}
		else {
			// Adjust the animation speed to match with how fast the
			// character is side-stepping			
			t = Mathf.Clamp (Mathf.Abs (speed / maxSidestepSpeed), 0, maxSidestepSpeed);

			if (sidewaysMotion > 0) {
				animationTarget["runright"].speed = Mathf.Lerp (0.25, 1, t);
				animationTarget.CrossFade ("runright");				
			}
			else {
				animationTarget["runleft"].speed = Mathf.Lerp (0.25, 1, t);
				animationTarget.CrossFade ("runleft");				
			}
		}
	}
	else
		// Play the idle animation by default
		animationTarget.CrossFade ("idle");
}


//	MY FUNCTIONS

function OnEndGame () {
	this.enabled = false;
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission