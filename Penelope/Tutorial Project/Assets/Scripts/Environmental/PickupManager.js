//	PickupManager.js
//	Description
//	Use

#pragma strict

@script RequireComponent (ParticleEmitter)

var ColliderPrefab : GameObject;
var depositTrigger : DepositTrigger;

function Start () {
	var emitter = particleEmitter;
	emitter.ClearParticles ();
	emitter.Emit ();
	
	var location : Vector3;
	var myParticles = emitter.particles;
	var colliderContainer = new GameObject("ParticleColliders");
	var toDestroy = new GameObject ("ObjectsToDestroy");
	
	for (var i : int;i < emitter.particleCount;i++) {
		if (transform.childCount <= 0) 
			break;
			
		var child = transform.GetChild (Random.Range (0, transform.childCount));
		myParticles[i].position = child.position;
		child.parent = toDestroy.transform;
		
		var Prefab : GameObject = Instantiate (ColliderPrefab,  myParticles[i].position, Quaternion.identity);
		var pickup : ParticlePickup = Prefab.GetComponent (ParticlePickup);
		pickup.emitter = emitter;
		pickup.index = i;
		
		Prefab.transform.parent = colliderContainer.transform;
	}
	Destroy (toDestroy);
	emitter.particles = myParticles;
}


function ActivateDepository () {
	depositTrigger.ActivateDepository();
}



// © 2010 Adam Buckner (aka: Little Angel) and theantranch.com (mailto: adam@theantranch.com)
// Not for reuse or resale without permission