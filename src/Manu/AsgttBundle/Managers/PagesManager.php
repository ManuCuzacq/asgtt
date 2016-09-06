<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Entity\Page;
use Manu\AsgttBundle\Managers\SerielManager;

class PagesManager extends SerielManager
{
	protected function addSecurityFilters($qb, $individu) {
		// NOTHING TO DO THERE !
		return;
	}
	
	public function getObjectClass() {
		return 'Manu\AsgttBundle\Entity\Page';
	}
	
	protected function buildQuery($qb, $params, $options = null) {
		$hasParams = false;
			
		if (isset($params['nom']) and $params['nom']) {
			$nom = $params['nom'];
			$qb->andWhere('page.nom = :nom')->setParameter('nom', $nom);
			$hasParams = true;
		}
	
		return $hasParams;
	}
	
	/**
	 * @return Article
	 */
	public function gePage($id){
		$page = $this->get($id);
		return $page;
	}
	
	/**
	 * @return Articles[]
	 */
	public function getAllPages() {
		$pages = $this->getAll();

		return $pages;
	}
	
	
	/**
	 * @return Articles
	 */
	public function getPageForName($name) {
		$params = array('nom' => $name);
	
		return $this->query($params, array('one' => true));
	}

}

?>
