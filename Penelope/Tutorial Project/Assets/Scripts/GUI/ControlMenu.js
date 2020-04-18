//	ControlMenu.js
//	Controls the Opening Menu, Chooses the Contol Method, Loads the Contol Method and Destroys this and other unnecessary objects
//	Attach to a ControlMenu GameObject

#pragma strict


//	HELPER CLASSES
class ControllerScene {
	var label : String;
	var controlScene : String;
}


//	BASIC VARIABLES
//	Game Objects and Components

//	Exposed Variables
var controllers : ControllerScene[];
var destroyOnLoad : Transform[];
var launchIntro : GameObject;
var background : Texture2D;
var display = false;
var font : Font;
var orbEmitter : GameObject;


//	Basic Game Variables
private var selection = -1; 
private var displayBackground = false; 


//	STANDARD FUNCTIONS


function Start () {
	launchIntro.SetActiveRecursively (false);
	orbEmitter.SetActiveRecursively (false);
}


function OnGUI () {
	GUI.skin.font = font;
	if (displayBackground) 
		GUI.DrawTexture (Rect (0, 0, Screen.width, Screen.height), background, ScaleMode.StretchToFill, false);
	if (display) {
		var hit : int = -1;
		var minHeight = 60;
		var areaWidth = 400;
		GUILayout.BeginArea (Rect ((Screen.width - areaWidth) / 2, (Screen.height - minHeight) / 2, areaWidth, minHeight));
		GUILayout.BeginHorizontal ();
		for (var i : int = 0;i< controllers.length;i++) {
			if (GUILayout.Button (controllers[i].label, GUILayout.MinHeight (minHeight))) {
				hit = i;
			} 
		} 
		if (hit >= 0) {
			selection = hit;
			guiTexture.enabled = false;
			display = false;
			displayBackground = false;
			ChangeControls ();
		} 
		GUILayout.EndHorizontal ();
		GUILayout.EndArea ();
	} 
} 


function Update () {
	if (!display && selection == -1 && iPhoneInput.touchCount > 0) {
		for (var i : int = 0;i< iPhoneInput.touchCount;i++) {
			var touch : iPhoneTouch = iPhoneInput.GetTouch (i);
			if (touch.phase == iPhoneTouchPhase.Began && guiTexture.HitTest (touch.position)) {
				display = true;
				displayBackground = false;
				guiTexture.enabled = false;
			}
		}
	}
}


//	MY FUNCTIONS

function ChangeControls () {
	for (var t in destroyOnLoad) 
		Destroy (t.gameObject);
	launchIntro.SetActiveRecursively (true);
	yield WaitUntilObjectDestroyed (launchIntro);
	displayBackground = true;
	orbEmitter.SetActiveRecursively (true);
	Application.LoadLevelAdditive (controllers[selection].controlScene);
	Destroy (gameObject, 1);

}


function WaitUntilObjectDestroyed (o : Object) {
	while (o)
		yield WaitForFixedUpdate();
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission