//	CameraRelativeControl.js
//	Controls the Player Object in a Camera Relative manner
//	Uses two joysticks to define movement and camera rotation
//	Attach to a Player Object

#pragma strict

	@script RequireComponent(CharacterController)

//	BASIC VARIABLES
//	Game Objects and Components

//	Instances of Helper Classes

//	Exposed Variables
var moveJoystick : Joystick;
var rotateJoystick : Joystick;
var cameraTransform : Transform;
var speed : float = 6;
var cameraPivot : Transform;
var rotationSpeed : Vector2 = Vector2(50, 25);
var jumpSpeed : float = 16;
var inAirMultiplier : float = 0.25;

//	Basic Game Variables
private var thisTransform : Transform;
private var character : CharacterController;
private var animationController : AnimationController;
private var velocity : Vector3;


//	STANDARD FUNCTIONS

function Start () {
	thisTransform = GetComponent(Transform);
	character = GetComponent(CharacterController);
	animationController = GetComponent( AnimationController );
	animationController.maxForwardSpeed = speed;
	
	var spawn = GameObject.Find ("PlayerSpawn");
	if (spawn) 
		thisTransform.position = spawn.transform.position;
}


function Update () {
	var movement =  cameraTransform.TransformDirection(Vector3(moveJoystick.position.x, 0, moveJoystick.position.y));
	movement.y = 0;
	movement.Normalize();
	
	var absJoyPos =  Vector2(Mathf.Abs(moveJoystick.position.x), Mathf.Abs(moveJoystick.position.y));
	movement *= speed * ((absJoyPos.x > absJoyPos.y) ? absJoyPos.x : absJoyPos.y);
	
	if (character.isGrounded) {
		if (rotateJoystick.tapCount == 2) {
			velocity = character.velocity;
			velocity.y = jumpSpeed;
		} 
	}
	else {
		velocity.y += Physics.gravity.y * Time.deltaTime;
		movement.x *= inAirMultiplier;
		movement.z *= inAirMultiplier;
	}
	
	movement += velocity;
	movement += Physics.gravity;
	movement *= Time.deltaTime;
	
	character.Move(movement);
	
	if ( character.isGrounded )
		velocity = Vector3.zero;
		
	FaceMovementDirection();
	
	var camRotation = rotateJoystick.position;
	camRotation.x *= rotationSpeed.x;
	camRotation.y *= rotationSpeed.y;
	camRotation *= Time.deltaTime;
	
	cameraPivot.Rotate(0, camRotation.x, 0, Space.World);
	cameraPivot.Rotate(camRotation.y, 0, 0);
}



//	MY FUNCTIONS

function FaceMovementDirection () {
	var horizontalVelocity : Vector3 = character.velocity;
	horizontalVelocity.y = 0;
	if (horizontalVelocity.magnitude > 0.1) 
		thisTransform.forward = horizontalVelocity.normalized;
}


function OnEndGame() {
	moveJoystick.Disable();
	rotateJoystick.Disable();
	this.enabled = false;
} 


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission