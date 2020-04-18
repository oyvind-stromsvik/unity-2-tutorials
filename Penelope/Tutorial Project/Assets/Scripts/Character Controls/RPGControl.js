//	RPGControl.js
//	Controls the Player Object in a Player Relative manner
//	Based on Player Relative Control script
//	Uses one joystick to define movement and touches to define camera rotation
//	Attach to a Player Object

#pragma strict

@script RequireComponent (CharacterController)


//	BASIC VARIABLES
//	Game Objects and Components

//	Instances of Helper Classes

//	Exposed Variables
var moveJoystick : Joystick;
var rotateJoystick : Joystick;
var cameraPivot : Transform;
var forwardSpeed : float = 6;
var backwardSpeed : float = 3;
var sidestepSpeed : float = 4;
var jumpSpeed : float = 16;
var inAirMultiplier : float = 0.25;
var rotationSpeed : Vector2 = Vector2 (50, 25);

//	Basic Game Variables
private var thisTransform : Transform;
private var character : CharacterController;
private var animationController : AnimationController;
private var cameraVelocity : Vector3;
private var velocity : Vector3;



//	STANDARD FUNCTIONS

function Start () {
	thisTransform = GetComponent (Transform);
	character = GetComponent (CharacterController);
	animationController = GetComponent( AnimationController );
	animationController.maxForwardSpeed = forwardSpeed;
	animationController.maxBackwardSpeed = backwardSpeed;
	animationController.maxSidestepSpeed = sidestepSpeed;
	
	var spawn = GameObject.Find ("PlayerSpawn");
	if (spawn) 
		thisTransform.position = spawn.transform.position;
}


function OnEnable () {
	
}


function FixedUpdate () {
	
}


function Update () {
	var movement = thisTransform.TransformDirection (Vector3 (moveJoystick.position.x, 0, moveJoystick.position.y));
	movement.y = 0;
	movement.Normalize ();
	
	var cameraTarget = Vector3.zero;
	
	var absJoyPos = Vector2 (Mathf.Abs (moveJoystick.position.x), Mathf.Abs (moveJoystick.position.y));
	if (absJoyPos.y > absJoyPos.x) {
		if (moveJoystick.position.y > 0) 
			movement *= forwardSpeed * absJoyPos.y;
		else {
			movement *= backwardSpeed * absJoyPos.y;
			cameraTarget.z = moveJoystick.position.y * 0.75;
		}
	}
	else {
		movement *= sidestepSpeed * absJoyPos.x;
		cameraTarget.x = -moveJoystick.position.x * 0.5;
	}
	
	if (character.isGrounded) {
		if (	.tapCount == 2) {
			velocity = character.velocity;
			velocity.y = jumpSpeed;
		}
	}
	else {
		velocity.y += Physics.gravity.y * Time.deltaTime;
		cameraTarget.z = -jumpSpeed * 0.25;
		movement.x *= inAirMultiplier;
		movement.z *= inAirMultiplier;
	}
	
	movement += velocity;
	movement += Physics.gravity;
	movement *= Time.deltaTime;
	
	character.Move(movement);
	
	if (character.isGrounded) 
		velocity = Vector3.zero;
		
	var pos = cameraPivot.localPosition;
	pos.x = Mathf.SmoothDamp(pos.x, cameraTarget.x, cameraVelocity.x, 0.3);
	pos.z = Mathf.SmoothDamp(pos.z, cameraTarget.z, cameraVelocity.z, 0.5);
	cameraPivot.localPosition = pos;

	if (character.isGrounded){
		var camRotation = rotateJoystick.position;	// : Vector2??
		camRotation.x *= rotationSpeed.x;
		camRotation.y *= rotationSpeed.y;
		camRotation *= Time.deltaTime;
		thisTransform.Rotate(0, camRotation.x, 0, Space.World);
		cameraPivot.Rotate(camRotation.y, 0, 0);
	}
}



//	MY FUNCTIONS

function OnEndGame (){
	moveJoystick.Disable ();
	rotateJoystick.Disable ();
	this.enabled = false;
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission