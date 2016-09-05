<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Entity\User;
use Manu\AsgttBundle\Managers\SerielManager;


class UsersManager extends SerielManager
{

	public function getObjectClass() {
		return 'Manu\AsgttBundle\Entity\User';
	}
	
	protected function buildQuery($qb, $params, $options = null) {
		$hasParams = false;
	
		// this is never used
	
		return $hasParams;
	}
	
	/**
	 * @return User
	 */
	public function getUser($id) {
		return $this->get($id);
	}
	
	
	public function getAllUsers(){
		return $this->getAll();
	}
}

?>
