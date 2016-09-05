<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Annotation\SerielCacheMethodPropertyConverter;
use Manu\AsgttBundle\Annotation\CacheMethodProperty;

abstract class BaseManager
{
	protected $container = null;
	
	protected $cache_config_list = array();
	
	public function __construct($container) {
		$this->container = $container;
	}
	
	/**
	 * @return EntityManager
	 */
	protected function getDoctrineEM() {
		return $this->container->get('doctrine')->getManager();
	}

	public abstract function getObjectClass();
	public function getObjectClassForList() {
		return $this->getObjectClass();
	}
	
	/*************** LIST FIELDS *****************/
	
	public function getListFields() {
		$reader = $this->container->get('annotation_reader');
	
		$converter = new SerielListePropertyConverter($reader);
		$reflected = $converter->convert($this->getObjectClass());
	
		return $reflected;
	}
	
	public function getReportingColRows() {
		$reader = $this->container->get('annotation_reader');
	
		$converter = new SerielReportingColrRowPropertyConverter($reader);
		$reflected = $converter->convert($this->getObjectClass());
	
		return $reflected;
	}
	
	public function getFieldsName() {
		$counter = 0;
		foreach (get_class_methods($this->getObjectClass()) as $method) {
			if(substr($method,0,3) == "get" ){
	
				// On check si la méthode a des paramètres.
				$m = new \ReflectionMethod($this->getObjectClass(), $method);
				$params = $m->getParameters();
	
				if ($params) {
					continue;
					echo "PARAMS[".print_r($params)."]<br/>\n";
				}
	
				$key = lcfirst(substr($method,3));
				$fields[$key] = array("label" => ucfirst($key));
	
				//if ($counter > 1) break;
				$counter++;
			}
		}
	
		unset($fields['tuilesParamsSupp']);
		unset($fields['listUid']);
	
		return $fields;
	}
	
	public function getDefaultFields() {
		//$fields = $this->getListFields();
	
		$listeMgr = $this->container->get('liste_manager');
		if (false) $listeMgr = new ListeManager();
	
		$renderers = $listeMgr->buildFieldsRenderer($this->getObjectClass());
	
		$res = array();
	
		$counter = 0; // On retourne les 5 premiers par défaut.
		foreach ($renderers as $renderer) {
			$res[$renderer->getPropertyName()] = $renderer->getPropertyName();
			$counter ++;
			if ($counter >= 5) break;
		}
	
		return $res;
	}
	
	public function getUserList($user, $context = null) {
		if (!$user) return null;
		if (is_string($user)) return null;
		
		$user_id = $user->getId();
		$type = strtolower($this->getObjectClass());
		
		$context_cache_key = null;
		
		$configListsMgr = $this->container->get('configuration_liste_manager');
		if (false) $configListsMgr = new ConfigurationListeManager();
		
		if ($context) {
			$context_cache_key = $user_id.'_'.$context;
			
			if (isset($this->cache_config_list[$context_cache_key])) return $this->cache_config_list[$context_cache_key];
			
			$config_liste = $configListsMgr->getConfigurationListeForUserTypeAndContext($user_id, $type, $context);
			
			if ($config_liste) {
				$this->cache_config_list[$context_cache_key] = $config_liste;
				return $config_liste;
			}
		}
			
		// We use some cache.
		if (isset($this->cache_config_list[$user_id])) return $this->cache_config_list[$user_id];
		
		$config_liste = $configListsMgr->getConfigurationListeForUserAndType($user_id, $type);
		$this->cache_config_list[$user_id] = $config_liste;
		
		if ($context_cache_key) {
			$this->cache_config_list[$context_cache_key] = $config_liste;
		}
		
		return $config_liste;
	}
	
	public function getUserFieldsName($user, $context = null) {
		$liste = $this->getUserList($user, $context);
		
		//error_log('TEST CONTEXT : liste '.$user->getId().' > '.$context.' : '.($liste ? $liste->getId() : 'NULL'));
	
		/*if( $liste == null )
			return $this->getDefaultFields();*/
		
		if($liste == null) return null;
	
		/*if( $liste->getContent() == null )
			return $this->getDefaultFields();*/
		
		$content = $liste->getContent();
		
		if ($content == null) return null;
	
		// On construit le tableau.
		//$allFields = $this->getFieldsName();
	
		$fields = array();
		foreach ($content as $cnt) {
			$fields[$cnt] = $cnt;
			/*if (isset($allFields[$cnt])) {
			 $fields[$cnt] = $allFields[$cnt];
				}*/
		}
	
		return $fields;
	}
	
	protected function updateCaches($obj) {
		$reader = $this->container->get('annotation_reader');
		
		$converter = new SerielCacheMethodPropertyConverter($reader);
		$reflected = $converter->convert($this->getObjectClass());
		
		foreach ($reflected as $refl) {
			// Sould do something like that.
			if (false) $refl = new CacheMethodProperty();
			eval('$obj->'.$refl->getMethodSet().'($obj->'.$refl->getMethodGet().'());');
		}
	}
	
	protected function updateListePropertiesCache($obj) {
		$debug = $obj->getId() == 74976;
		if ($debug) error_log('UPDATE TEST 1 : '.$obj);
		if (method_exists($obj, 'updateListePropertiesCache')) {
			$obj->updateListePropertiesCache();
		}
	}
	
	public function getFilterFromName($name, $value = null, $options = array()) {
		// This has to be overrided
		return null;
	}
}