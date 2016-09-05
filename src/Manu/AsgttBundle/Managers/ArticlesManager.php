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
			
		/*if (isset($params['nom']) and $params['nom']) {
			$nom = $params['nom'];
			$qb->andWhere('article.nom = :nom')->setParameter('nom', $nom);
			$hasParams = true;
		}*/
	
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
	
	
	/**
	 * @return Articles
	 */
	public function getArticleForName($name) {
		$params = array('nom' => $name);
	
		return $this->query($params, array('one' => true));
	}
	
	
	/*public function save($obj, $flush = false) {
		if ($obj instanceof Article) {
			$obj->setEmpty($obj->isEpuise());
		}
	
		return parent::save($obj, $flush);
	}*/
}

?>
