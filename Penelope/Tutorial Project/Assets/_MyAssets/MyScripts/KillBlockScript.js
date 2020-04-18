function OnTriggerEnter (other : Collider) {
	if (other.tag == "Player") {
		var scoreKeeper : ScoreKeeper = other.GetComponent(ScoreKeeper);
		scoreKeeper.EndGame ();
	}
}