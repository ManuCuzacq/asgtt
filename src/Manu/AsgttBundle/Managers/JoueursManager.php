<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Entity\Joueur;
use Manu\AsgttBundle\Managers\SerielManager;

class JoueursManager extends SerielManager
{
	protected function addSecurityFilters($qb, $individu) {
		// NOTHING TO DO THERE !
		return;
	}
	
	public function getObjectClass() {
		return 'Manu\AsgttBundle\Entity\Joueur';
	}
	
	protected function buildQuery($qb, $params, $options = null) {
		$hasParams = false;
			
		if (isset($params['user_id']) and $params['user_id']) {
			$user_id = $params['user_id'];
			$qb->andWhere('joueur.user = :user_id')->setParameter('user_id', $user_id);
			$hasParams = true;
		}
	
		return $hasParams;
	}
	
	/**
	 * @return Joueur;
	 */
	public function getJoueur($id){
		$joueur = $this->get($id);
		return $joueur;
	}
	
	/**
	 * @return Joueurs[]
	 */
	public function getAllJoueurs() {
		$Joueurs = $this->getAll();

		return $Joueurs;
	}
	
	public function getJoueurForUser($user_id){
		$params = array('user_id' => $user_id);
	
		return $this->query($params, array('one' => true));
	}
	
}

?>
