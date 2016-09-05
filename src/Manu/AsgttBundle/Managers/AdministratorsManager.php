<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Managers\SerielManager;

class AdministratorsManager extends SerielManager
{
	protected function addSecurityFilters($qb, $individu) {
		// NOTHING TO DO THERE !
		return;
	}
	
	public function getObjectClass() {
		return 'Manu\AsgttBundle\Entity\Administrator';
	}
	
	protected function buildQuery($qb, $params, $options = null) {
		$hasParams = false;
		
		if (isset($params['user_id']) and $params['user_id']) {
			$user_id = $params['user_id'];
			$qb->andWhere('administrator.user = :user_id')->setParameter('user_id', $user_id);
			$hasParams = true;
		}
		
		return $hasParams;
	}
	
	public function getAdministratorForUser($user_id){
		$params = array('user_id' => $user_id);
		
		return $this->query($params, array('one' => true));
	}
	
	public function getAllAdministrators($options = array()) {
		return $this->getAll($options);
	}
	
}

?>
