<?php 

namespace Seriel\CRMBundle\Managers;

use Seriel\AppliToolboxBundle\Managers\SerielManager;

class ReadOnlySerielManager extends SerielManager {
	
	public function save($obj, $flush = false) {
		return false;
	}
	
	public function remove($obj, $flush = false) {
		return false;
	}
	
}