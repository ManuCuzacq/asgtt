<?php

namespace Manu\AsgttBundle\Entity;

abstract class BaseObject {
	
	public abstract function getId();
	
	public function getListUid() {
		return $this->getId();
	}
	
	public function getDOI() {
		$className = get_class($this);
		$index = strrpos($className, "\\");
		if ($index !== false) $className = substr($className, $index+1);
	
		return $className.'-'.$this->getId();
	}
	
	public function render($options = array(), $templating = null) {
		if (!$templating) {
			global $kernel;
			
			$container = $kernel->getContainer();
			$templating = $container->get('templating');
		}
		return $this->__render($options, $templating);
	}
	public function __render($options, $templating) {
		return false;
	}
	
	public function getTuilesParamsSupp() {
		return array();
	}
	
	public function __toString() {
		return $this->getDOI();
	}
	
}