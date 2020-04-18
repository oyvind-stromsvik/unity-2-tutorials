//	Joystick.js
//	Controls a moveable joystick that handles touch input, taps and phases.
//	Dead zones can control where the joystick input gets picked up and can be normalized.
//	Attach to a joystick object.

//#pragma strict

@script RequireComponent (GUITexture)


//	BASIC VARIABLES
//	Game Objects and Components

//	Instances of Helper Classes

//	Exposed Variables
var position : Vector2;
var deadZone : Vector2 = Vector2.zero;
var normalize : boolean = false;
var tapCount : int;

//	Basic Game Variables
static private var joysticks : Joystick[];
static private var enumeratedJoysticks : boolean = false;
static private var tapTimeDelta : float = 0.3;		//	Why is this STATIC??

private var lastFingerId = -1;
private var tapTimeWindow : float;
private var gui : GUITexture;
private var defaultRect : Rect;
private var guiBoundary : Boundary = Boundary();
private var guiTouchOffset : Vector2;
private var guiCenter : Vector2;


//	Cached Link Variables


//	HELPER CLASSES
class Boundary {
	var min : Vector2 = Vector2.zero;
	var max : Vector2 = Vector2.zero;
}


//	STANDARD FUNCTIONS

function Start () {
	gui = GetComponent(GUITexture);
	
	//	Get where the gui texture was originally placed
	defaultRect = gui.pixelInset;
	
	//	Get our offset for center instead of corner
	guiTouchOffset.x = defaultRect.width * 0.5;
	guiTouchOffset.y = defaultRect.height * 0.5;
	
	//	Cache the Center Point
	guiCenter.x = defaultRect.x + guiTouchOffset.x;
	guiCenter.y = defaultRect.y + guiTouchOffset.y;
	
	//	Set the Thumbstick Clamp to be related to the default rect and the touch offset.
	guiBoundary.min.x = defaultRect.x - guiTouchOffset.x;
	guiBoundary.max.x = defaultRect.x + guiTouchOffset.x;
	guiBoundary.min.y = defaultRect.y - guiTouchOffset.y;
	guiBoundary.max.y = defaultRect.y + guiTouchOffset.y;
}


function Update () {
	if (!enumeratedJoysticks) {
		joysticks = FindObjectsOfType(Joystick);
		enumeratedJoysticks = true;
	}

	var count = iPhoneInput.touchCount;
	
	if (tapTimeWindow > 0)
		tapTimeWindow -= Time.deltaTime;
	else
		tapCount = 0;
	
	//	if no fingers are touching the device, reset the joystick.
	if (count == 0)
		Reset();
	
	//	else there are fingers touching the device, continue.
	else {
		
		for (var i : int = 0; i < count; i++) {
			var touch : iPhoneTouch = iPhoneInput.GetTouch(i);
			
			//	account for the rect offset in our calculations
			var guiTouchPos : Vector2 = touch.position - guiTouchOffset;
			
			//	if the touch is over the graphic AND if the finger is new count up tap count
			if (gui.HitTest(touch.position) && (lastFingerId == -1 || lastFingerId != touch.fingerId)) {
				lastFingerId = touch.fingerId;
				
				if (tapTimeWindow > 0)
					tapCount++;
				else {
					tapCount = 1;
					tapTimeWindow = tapTimeDelta;
				}
		
				for (var j : Joystick in joysticks) {
			 		if (j != this) 
						j.LatchedFinger (touch.fingerId);
				}
			}

			if (lastFingerId == touch.fingerId) {
				if (touch.tapCount > tapCount)
					tapCount = touch.tapCount;
			
				gui.pixelInset.x = Mathf.Clamp(guiTouchPos.x, guiBoundary.min.x, guiBoundary.max.x);
				gui.pixelInset.y = Mathf.Clamp(guiTouchPos.y, guiBoundary.min.y, guiBoundary.max.y);
			
				//	Another check to see if fingers are touching...
				if (touch.phase == iPhoneTouchPhase.Ended || touch.phase == iPhoneTouchPhase.Canceled)
					Reset();
			}
		}
	}
	
	position.x = (gui.pixelInset.x + guiTouchOffset.x - guiCenter.x) / guiTouchOffset.x;
	position.y = (gui.pixelInset.y + guiTouchOffset.y - guiCenter.y) / guiTouchOffset.y;
	
	var absoluteX = Mathf.Abs(position.x);
	var absoluteY = Mathf.Abs(position.y);
	
	if (absoluteX < deadZone.x) {
		position.x = 0;
	}
	else if (normalize) {
		position.x = Mathf.Sign (position.x) * (absoluteX - deadZone.x) / (1 - deadZone.x);
	}

	if (absoluteY < deadZone.y) {
		position.y = 0;
	}
	else if (normalize) {
		position.y = Mathf.Sign (position.y) * (absoluteY - deadZone.y) / (1 - deadZone.y);
	}
}



//	MY FUNCTIONS

function Reset () {
	gui.pixelInset = defaultRect;
	lastFingerId = -1;
}


function LatchedFinger (fingerId : int) {
	if (lastFingerId == fingerId) 
		Reset();
}


function Disable() {
	gameObject.active = false;
	enumeratedJoysticks = false;
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission