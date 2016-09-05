<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Entity\ConfigurationListe;

class ConfigurationListeManager extends SerielManager {
	
	public function getObjectClass() {
		return 'Seriel\AppliToolboxBundle\Entity\ConfigurationListe';
	}
	
	protected function getAlias() {
		return 'config_liste';
	}
	
	protected function addSecurityFilters($qb, $individu) {
		// NO SECURITY HERE.
		return;
	}
	
	protected function buildQuery($qb, $params, $options = null) {
		$hasParams = false;
	
		if (isset($params['user_id']) && $params['user_id']) {
			$user_id = $params['user_id'];
			$qb->andWhere('config_liste.user = :user_id')->setParameter('user_id', $user_id);
			$hasParams = true;
		}
		
		if (isset($params['type']) && $params['type']) {
			$type = $params['type'];
			$qb->andWhere('config_liste.type = :type')->setParameter('type', $type);
			$hasParams = true;
		}
		
		if (isset($params['context']) && $params['context']) {
			$context = $params['context'];
			$qb->andWhere('config_liste.context = :context')->setParameter('context', $context);
			$hasParams = true;
		} else if (isset($params['context_null']) && $params['context_null']) {
			$qb->andWhere('config_liste.context is null or config_liste.context = \'\'');
			$hasParams = true;
		}
		
		return $hasParams;
	}
	
	/**
	 * @return ConfigurationListe
	 */
	public function getConfigurationListeForUserAndType($user_id, $type) {
		return $this->query(array('user_id' => $user_id, 'type' => $type, 'context_null' => true), array('one' => true));
	}
	
	/**
	 * @return ConfigurationListe
	 */
	public function getConfigurationListeForUserTypeAndContext($user_id, $type, $context) {
		return $this->query(array('user_id' => $user_id, 'type' => $type, 'context' => $context), array('one' => true));
	}
	
	/**
	 * @return ConfigurationListe[]
	 */
	public function getAllConfigurationListes() {
		return $this->getAll();
	}
	
}

?>
