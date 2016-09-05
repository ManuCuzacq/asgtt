<?php

namespace Manu\AsgttBundle\Managers;

class ManagersManager {
	protected static $manager = null;
	
	protected $doctrine = null;
	protected $logger = null;
	protected $templating = null;
	protected $container = null;
	
	protected $cache_managers = array();
	
	public static function getManager() {
		if (self::$manager == null) {
			global $kernel;
			self::$manager = $kernel->getContainer()->get('managers_manager');
		}
		
		return self::$manager;
	}

	public function __construct($doctrine, $templating, $logger, $container) {
		$this->doctrine = $doctrine;
		$this->templating = $templating;
		$this->logger = $logger;
		$this->container = $container;
		
		self::$manager = $this;
	}
	
	public function getContainer() {
		return $this->container;
	}
	
	public function getManagerForType($type) {
		if (isset($this->cache_managers[$type])) return $this->cache_managers[$type];
		
		$index = strrpos($type, "\\");
		if ($index !== false) $type = substr($type, $index+1);
		$type = strtolower($type);
	
		$logger = $this->container->get('logger');
		$logger->info('TEST MANAGER UTILS : '.$type);
			
		if ($this->container->has(strtolower($type)."s_manager")) {
			$mgr = $this->container->get(strtolower($type)."s_manager");
			$this->cache_managers[$type] = $mgr;
			return $mgr;
		}
		if ($this->container->has(strtolower($type)."x_manager")) {
			$mgr = $this->container->get(strtolower($type)."x_manager");
			$this->cache_managers[$type] = $mgr;
			return $mgr;
		}
		if ($this->container->has(strtolower($type)."_manager")) {
			$mgr = $this->container->get(strtolower($type)."_manager");
			$this->cache_managers[$type] = $mgr;
			return $mgr;
		}
		if ($this->container->has(strtolower($type))) {
			$mgr = $this->container->get(strtolower($type));
			$this->cache_managers[$type] = $mgr;
			return $mgr;
		}
	
		return null;
	}
}
