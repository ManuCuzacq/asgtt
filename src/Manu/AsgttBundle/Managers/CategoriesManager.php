<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Entity\Categorie;
use Manu\AsgttBundle\Managers\SerielManager;

class CategoriesManager extends SerielManager
{
	protected function addSecurityFilters($qb, $individu) {
		// NOTHING TO DO THERE !
		return;
	}
	
	public function getObjectClass() {
		return 'Manu\AsgttBundle\Entity\Categorie';
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
	 * @return Categorie;
	 */
	public function getCategorie($id){
		$categorie = $this->get($id);
		return $categorie;
	}
	
	/**
	 * @return Categories[]
	 */
	public function getAllCategories() {
		$categories = $this->getAll();

		return $categories;
	}
	
}

?>
