//	TapControl.js
//	Controls the Player Object using finger gestures & taps
//	Attach to a Player Object

#pragma strict

@script RequireComponent(CharacterController)

enum ControlState {
	WaitingForFirstTouch,
	WaitingForSecondTouch,
	MovingCharacter,
	WaitingForMovement,
	ZoomingCamera,
	RotatingCamera,
	WaitingForNoFingers
}


//	BASIC VARIABLES
//	Game Objects and Components

//	Instances of Helper Classes

//	Exposed Variables
var cameraObject : GameObject;
var cameraPivot : Transform;
var jumpButton : GUITexture;
var speed : float;
var jumpSpeed : float;
var inAirMultiplier : float = 0.25;
var minimumDistanceToMove = 1.0;
var minimumTimeUntilMove = 0.25;

var zoomEnabled : boolean = true;
var zoomEpsilon : float = 25;
var zoomRate : float;
var rotateEnabled : boolean = true;
var rotateEpsilon : float = 1;

//	Basic Game Variables
private var state = ControlState.WaitingForFirstTouch;
private var fingerDown : int[] = new int[2];
private var fingerDownPosition : Vector2[] = new Vector2[2];
private var fingerDownFrame : int[] = new int[2];
private var firstTouchTime : float;

private var zoomCamera : ZoomCamera;
private var cam : Camera;
private var thisTransform : Transform;
private var character : CharacterController;
private var animationController : AnimationController;
private var targetLocation : Vector3;
private var moving : boolean = false;
private var rotationTarget : float;
private var rotationVelocity : float;
private var velocity : Vector3;



//	STANDARD FUNCTIONS

function Start () {
	thisTransform = transform;
	zoomCamera = cameraObject.GetComponent (ZoomCamera);
//	Debug.Log(zoomCamera);
	cam = cameraObject.camera;
	character = GetComponent (CharacterController);
	animationController = GetComponent (AnimationController);
	animationController.maxForwardSpeed = speed;
	
	ResetControlState ();
	
	var spawn = GameObject.Find ("PlayerSpawn");
	if (spawn) 
		thisTransform.position = spawn.transform.position;
}


function Update () {
	var touchCount : int = iPhoneInput.touchCount;
	if (touchCount == 0) {
		ResetControlState ();
	}
	else {
		var i : int;
		var touch : iPhoneTouch;
		var touches = iPhoneInput.touches;
		
		var touch0 : iPhoneTouch;
		var touch1 : iPhoneTouch;
		var gotTouch0 = false;
		var gotTouch1 = false;		
		
		// Check if we got the first finger down
		if (state == ControlState.WaitingForFirstTouch) {
			for (i = 0;i < touchCount;i++) {
				touch = touches[i];
		
				if (touch.phase != iPhoneTouchPhase.Ended && touch.phase != iPhoneTouchPhase.Canceled) {
					state = ControlState.WaitingForSecondTouch;
					firstTouchTime = Time.time;
					fingerDown[0] = touch.fingerId;
					fingerDownPosition[0] = touch.position;
					fingerDownFrame[0] = Time.frameCount;
					break;
				}
			}
		}
		
		// Wait to see if a second finger touches down. Otherwise, we will
		// register this as a character move					
		if (state == ControlState.WaitingForSecondTouch) {
			for (i = 0;i < touchCount;i++) {
				touch = touches[i];

				if (touch.phase != iPhoneTouchPhase.Canceled) {
					if (touchCount >= 2 && touch.fingerId != fingerDown[0]) {
						// If we got a second finger, then let's see what kind of
						// movement occurs
						state = ControlState.WaitingForMovement;
						fingerDown[1] = touch.fingerId;
						fingerDownPosition[1] = touch.position;
						fingerDownFrame[1] = Time.frameCount;						
						break;
					}
					else if (touchCount == 1) {
						var deltaSinceDown = touch.position - fingerDownPosition[0];
						
						// Either the finger is held down long enough to count
						// as a move or it is lifted, which is also a move.
						if (touch.fingerId == fingerDown[0] && (Time.time > firstTouchTime + minimumTimeUntilMove || touch.phase == iPhoneTouchPhase.Ended)) {
							state = ControlState.MovingCharacter;
							break;
						}							
					}
				}
			}
		}
		
		// Now that we have two fingers down, let's see what kind of gesture is made			
		if (state == ControlState.WaitingForMovement) {	
			// See if we still have both fingers	
			for (i = 0;i < touchCount;i++) {
				touch = touches[i];

				if (touch.phase == iPhoneTouchPhase.Began) {
					if (touch.fingerId == fingerDown[0] && fingerDownFrame[0] == Time.frameCount) {
						// We need to grab the first touch if this
						// is all in the same frame, so the control
						// state doesn't reset.
						touch0 = touch;
						gotTouch0 = true;
					}
					else if (touch.fingerId != fingerDown[0] && touch.fingerId != fingerDown[1]) {
						// We still have two fingers, but the second
						// finger was lifted and touched down again
						fingerDown[1] = touch.fingerId;
						touch1 = touch;
						gotTouch1 = true;
					}
				}
										
				if (touch.phase == iPhoneTouchPhase.Moved || touch.phase == iPhoneTouchPhase.Stationary || touch.phase == iPhoneTouchPhase.Ended) {
					if (touch.fingerId == fingerDown[0]) {
						touch0 = touch;
						gotTouch0 = true;
					}
					else if (touch.fingerId == fingerDown[1]) {
						touch1 = touch;
						gotTouch1 = true;
					}
				}
			}
			
			if (gotTouch0) {
				if (gotTouch1) {
					var originalVector = fingerDownPosition[1] - fingerDownPosition[0];
					var currentVector = touch1.position - touch0.position;
					var originalDir = originalVector / originalVector.magnitude;
					var currentDir = currentVector / currentVector.magnitude;
					var rotationCos : float = Vector2.Dot (originalDir, currentDir);
					
					if (rotationCos < 1) {	// if it is 1, then we have no rotation
						var rotationRad = Mathf.Acos (rotationCos);
						if (rotationRad > rotateEpsilon * Mathf.Deg2Rad) {
							// Enough rotation was applied with the two-finger movement,
							// so let's switch to rotate the camera
							state = ControlState.RotatingCamera;
						}
					}
					
					// If we aren't rotating the camera, then let's check for a zoom
					if (state == ControlState.WaitingForMovement) {
						var deltaDistance = originalVector.magnitude - currentVector.magnitude;
						if (Mathf.Abs (deltaDistance) > zoomEpsilon) {
							// The distance between fingers has changed enough
							// to count this as a pinch
							state = ControlState.ZoomingCamera;
						}
					}		
				}
			}
			else {
				// A finger was lifted, so let's just wait until we have no fingers
				// before we reset to the origin state
				state = ControlState.WaitingForNoFingers;
			}
		}	
		
//		// Now that we are either rotating or zooming the camera, let's keep
		// feeding those changes until we no longer have two fingers
		if (state == ControlState.RotatingCamera || state == ControlState.ZoomingCamera) {
			for (i = 0; i < touchCount; i++) {
				touch = touches[i];

				if (touch.phase == iPhoneTouchPhase.Moved || touch.phase == iPhoneTouchPhase.Stationary || touch.phase == iPhoneTouchPhase.Ended) {
					if (touch.fingerId == fingerDown[0]) {
						touch0 = touch;
						gotTouch0 = true;
					}
					else if (touch.fingerId == fingerDown[1]) {
						touch1 = touch;
						gotTouch1 = true;
					}
				}
			}
			
			if (gotTouch0) {
				if (gotTouch1) {
					CameraControl (touch0, touch1);
				}
			}
			else {
				// A finger was lifted, so let's just wait until we have no fingers
				// before we reset to the origin state
				state = ControlState.WaitingForNoFingers;
			}
		}		
	}

	// Apply character movement if we have any		
	CharacterControl ();
Debug.Log (state);

//	var touchCount : int = iPhoneInput.touchCount;
//	if (touchCount == 0) {
//		ResetControlState ();
//	}
//	else {
//		// everything else is going to go here
//		var i : int;
//		var touch : iPhoneTouch;
//		var touches = iPhoneInput.touches;
//		var touch0 : iPhoneTouch;
//		var touch1 : iPhoneTouch;
//		var gotTouch0 = false;
//		var gotTouch1 = false;
//		
//		if (state == ControlState.WaitingForFirstTouch) {
//			for (i = 0;i < touchCount;i++) {
//				touch = touches[i];
//				if (touch.phase != iPhoneTouchPhase.Ended && touch.phase != iPhoneTouchPhase.Canceled) {
//					state = ControlState.WaitingForSecondTouch;
//					firstTouchTime = Time.time;
//					fingerDown[0] = touch.fingerId;
//					fingerDownPosition[0] = touch.position;
//					fingerDownFrame[0] = Time.frameCount;
//					break;
//				}
//			}
//		}
//		if (state == ControlState.WaitingForSecondTouch) {
//			for (i = 0;i < touchCount;i++) {
//				touch = touches[i];
//				if (touch.phase != iPhoneTouchPhase.Canceled) {
//					if (touchCount >= 2 && touch.fingerId != fingerDown[0]) {
//						state = ControlState.WaitingForMovement;
//						fingerDown[1] = touch.fingerId;
//						fingerDownPosition[1] = touch.position;
//						fingerDownFrame[1] = Time.frameCount;
//						break;
//					}
//					else if (touchCount == 1) {
//						var deltaSinceDown = touch.position - fingerDownPosition[0];
//						if (touch.fingerId == fingerDown[0] && (Time.time > firstTouchTime + minimumTimeUntilMove || touch.phase == iPhoneTouchPhase.Ended)) {
//							state = ControlState.MovingCharacter;
//							break;
//						}
//					}
//				}
//			}
//		}
//		
//		//end of everything else goes here
//	}
}

function LateUpdate() {
	// Seek towards target rotation, smoothly
	cameraPivot.eulerAngles.y = Mathf.SmoothDampAngle (cameraPivot.eulerAngles.y, rotationTarget, rotationVelocity, 0.3);
}



//	MY FUNCTIONS

function ResetControlState () {
	state = ControlState.WaitingForFirstTouch;
	fingerDown[0] = -1;
	fingerDown[1] = -1;
}


function FaceMovementDirection () {
	var horizontalVelocity : Vector3 = character.velocity;
	horizontalVelocity.y = 0;
	if (horizontalVelocity.magnitude > 0.1)
		thisTransform.forward = horizontalVelocity.normalized;
}


function CharacterControl () {
	var count : int = iPhoneInput.touchCount;	
	if (count == 1 && state == ControlState.MovingCharacter) {
		var touch : iPhoneTouch = iPhoneInput.GetTouch (0);
		if (character.isGrounded && jumpButton.HitTest (touch.position)) {
			// Apply the current movement to launch velocity
			velocity = character.velocity;
			velocity.y = jumpSpeed;
		}
		else if (!jumpButton.HitTest (touch.position) && touch.phase != iPhoneTouchPhase.Began) {
			// If we aren't jumping, then let's move to where the touch was placed
			var ray = cam.ScreenPointToRay (Vector3 (touch.position.x, touch.position.y));
			
			var hit : RaycastHit;
			if (Physics.Raycast (ray, hit)) {
				var touchDist : float = (transform.position - hit.point).magnitude;
				if (touchDist > minimumDistanceToMove) {
					targetLocation = hit.point;
				}
				moving = true;
			}
		}
	}
	
	var movement : Vector3 = Vector3.zero;
	
	if (moving) {
		// Move towards the target location
		movement = targetLocation - thisTransform.position;
		movement.y = 0;
		var dist : float = movement.magnitude;
		
		if (dist < 1) {
			moving = false;
		}
		else {
			movement = movement.normalized * speed;
		}
	}
	
	if (!character.isGrounded) {			
		// Apply gravity to our velocity to diminish it over time
		velocity.y += Physics.gravity.y * Time.deltaTime;
		
		// Adjust additional movement while in-air
		movement.x *= inAirMultiplier;
		movement.z *= inAirMultiplier;
	}
	
	movement += velocity;		
	movement += Physics.gravity;
	movement *= Time.deltaTime;

	// Actually move the character
	character.Move (movement);
	
	if (character.isGrounded)
		// Remove any persistent velocity after landing
		velocity = Vector3.zero;

	// Face the character to match with where she is moving	
	FaceMovementDirection ();
}


//function CameraControl( touch0 : iPhoneTouch, touch1 : iPhoneTouch )
//{						
//	if( rotateEnabled && state == ControlState.RotatingCamera )
//	{			
//		var currentVector : Vector2 = touch1.position - touch0.position;
//		var currentDir = currentVector / currentVector.magnitude;
//		var lastVector : Vector2 = ( touch1.position - touch1.deltaPosition ) - ( touch0.position - touch0.deltaPosition );
//		var lastDir = lastVector / lastVector.magnitude;
//		
//		// Get the rotation amount between last frame and this frame
//		var rotationCos : float = Vector2.Dot( currentDir, lastDir );
//
//		if ( rotationCos < 1 ) // if it is 1, then we have no rotation
//		{
//			var currentVector3 : Vector3 = Vector3( currentVector.x, currentVector.y );
//			var lastVector3 : Vector3 = Vector3( lastVector.x, lastVector.y );				
//			var rotationDirection : float = Vector3.Cross( currentVector3, lastVector3 ).normalized.z;
//				
//			// Accumulate the rotation change with our target rotation
//			var rotationRad = Mathf.Acos( rotationCos );
//			rotationTarget += rotationRad * Mathf.Rad2Deg * rotationDirection;
//			
//			// Wrap rotations to keep them 0-360 degrees
//			if ( rotationTarget < 0 )
//				rotationTarget += 360;
//			else if ( rotationTarget >= 360 )
//				rotationTarget -= 360;
//		}
//	}
//	else if( zoomEnabled && state == ControlState.ZoomingCamera )
//	{
//		var touchDistance = ( touch1.position - touch0.position ).magnitude;
//		var lastTouchDistance = ( ( touch1.position - touch1.deltaPosition ) - ( touch0.position - touch0.deltaPosition ) ).magnitude;
//		var deltaPinch = touchDistance - lastTouchDistance;	
//
//		// Accumulate the pinch change with our target zoom
//		zoomCamera.zoom += deltaPinch * zoomRate * Time.deltaTime;
//	}
//}


function CameraControl (touch0 : iPhoneTouch, touch1 : iPhoneTouch) {						
	if (rotateEnabled && state == ControlState.RotatingCamera) {
		var currentVector : Vector2 = touch1.position - touch0.position;
		var currentDir = currentVector / currentVector.magnitude;
		var lastVector : Vector2 = (touch1.position - touch1.deltaPosition) - (touch0.position - touch0.deltaPosition);
		var lastDir = lastVector / lastVector.magnitude;
		
		// Get the rotation amount between last frame and this frame
		var rotationCos : float = Vector2.Dot (currentDir, lastDir);

		if (rotationCos < 1) {	// if it is 1, then we have no rotation
			var currentVector3 : Vector3 = Vector3 (currentVector.x, currentVector.y);
			var lastVector3 : Vector3 = Vector3 (lastVector.x, lastVector.y);
			var rotationDirection : float = Vector3.Cross (currentVector3, lastVector3).normalized.z;
				
			// Accumulate the rotation change with our target rotation
			var rotationRad = Mathf.Acos (rotationCos);
			rotationTarget += rotationRad * Mathf.Rad2Deg * rotationDirection;
			
			// Wrap rotations to keep them 0-360 degrees
			if (rotationTarget < 0)
				rotationTarget += 360;
			else if (rotationTarget >= 360)
				rotationTarget -= 360;
		}
	}
	else if (zoomEnabled && state == ControlState.ZoomingCamera) {
		var touchDistance = (touch1.position - touch0.position).magnitude;
		var lastTouchDistance = ((touch1.position - touch1.deltaPosition) - (touch0.position - touch0.deltaPosition)).magnitude;
		var deltaPinch = touchDistance - lastTouchDistance;	

		// Accumulate the pinch change with our target zoom
		zoomCamera.zoom += deltaPinch * zoomRate * Time.deltaTime;
	}
}


function OnEndGame () {
	this.enabled = false;
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission