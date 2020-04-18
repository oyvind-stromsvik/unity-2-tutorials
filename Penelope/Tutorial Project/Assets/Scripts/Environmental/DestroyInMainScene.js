//	DestroyInMainScene.js
//	Destoys the GameObject it is attached to when loaded into Scene 0
//	Attach to a GameObject to destroy on load into Scene 0

#pragma strict

function Start() {
	if ( Application.loadedLevel == 0 )
		Destroy( gameObject );
}


// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission