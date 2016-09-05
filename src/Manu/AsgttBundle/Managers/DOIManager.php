<?php

namespace Manu\AsgttBundle\Managers;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Manu\AsgttBundle\Managers\ManagersManager;

class DOIManager {
	protected $container = null;
	protected $doctrine = null;
	protected $logger = null;
	protected $templating = null;
	
	public function __construct($container, $doctrine, $templating, $logger) {
		$this->container = $container;
		$this->doctrine = $doctrine;
		$this->templating = $templating;
		$this->logger = $logger;
	}
	
	public function getObjectForDOI($doi) {
		// Let's explode the doi to keep last entity.
		$splitted = explode(' ', $doi);
		$elemDOI = $splitted[count($splitted)-1];
		
		$splitted2 = explode('-', $elemDOI);
		
		$objType = $splitted2[0];
		$objId = $splitted2[1];
		
		// Let's get manager.
		$manager = ManagersManager::getManager()->getManagerForType($objType);
		if (!$manager) {
			$this->logger->error("DOIManager : Manager not found for type : $objType for doi $doi");
			return false;
		}
		
		return $manager->get($objId);
	}
	
	public function getListObjectsForListDois($dois) {
		if (!$dois) return array();
		
		// Let's build a map by obj type.
		$ids_by_type = array();
		foreach ($dois as $doi) {
			$splitted = explode(' ', $doi);
			$elemDOI = $splitted[count($splitted)-1];
			
			$splitted2 = explode('-', $elemDOI);
			
			$objType = $splitted2[0];
			$objId = $splitted2[1];
			
			if (!isset($ids_by_type[$objType])) $ids_by_type[$objType] = array();
			$ids_by_type[$objType][] = $objId;
		}
		
		$result = array();
		
		// We now get all our results.
		foreach ($ids_by_type as $objType => $ids) {
			if (count($ids) == 0) continue; // Should never happen anyway
			
			$manager = ManagersManager::getManager()->getManagerForType($objType);
			if (!$manager) {
				$this->logger->error("DOIManager : Manager not found for type : $objType");
				continue;
			}
			
			$objs = $manager->query(array('ids' => $ids));
			$result = array_merge($result, $objs);
		}
		
		return $result;
		
		/*$res = array();
		// TODO : optimize this method !
		foreach ($dois as $doi) {
			$obj = $this->getObjectForDOI($doi);
			if ($obj) $res[] = $obj;
		}
		
		return $res;*/
	}

}