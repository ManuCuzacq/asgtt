<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Entity\Article;
use Manu\AsgttBundle\Managers\SerielManager;

class ArticlesManager extends SerielManager
{
	protected function addSecurityFilters($qb, $individu) {
		// NOTHING TO DO THERE !
		return;
	}
	
	public function getObjectClass() {
		return 'Manu\AsgttBundle\Entity\Article';
	}
	
	protected function buildQuery($qb, $params, $options = null) {
		$hasParams = false;
			
		return $hasParams;
	}
	
	/**
	 * @return Article
	 */
	public function getArticle($id){
		$article = $this->get($id);
		return $article;
	}
	
	/**
	 * @return Articles[]
	 */
	public function getAllArticles() {
		$articles = $this->getAll();

		return $articles;
	}

}

?>
