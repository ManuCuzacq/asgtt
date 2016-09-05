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
			
		/*if (isset($params['nom']) and $params['nom']) {
			$nom = $params['nom'];
			$qb->andWhere('article.nom = :nom')->setParameter('nom', $nom);
			$hasParams = true;
		}*/
	
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
	
}

?>
