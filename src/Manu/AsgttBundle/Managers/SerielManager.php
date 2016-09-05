<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Utils\DateUtils;
use Doctrine\ORM\Mapping\OrderBy;
use Doctrine\ORM\EntityManager;
use Manu\AsgttBundle\Annotation\SerielListePropertyConverter;
use Manu\AsgttBundle\Annotation\SerielReportingColrRowPropertyConverter;
use Doctrine\ORM\NonUniqueResultException;
use Manu\AsgttBundle\Utils\Recherche\SearchObject;
use Manu\AsgttBundle\Utils\DatabaseUtils;

abstract class SerielManager extends BaseManager
{
	protected $doctrine = null;
	protected $logger = null;
	protected $class = null;

	public function __construct($doctrine, $logger, $container) {
		parent::__construct($container);
		
		$this->doctrine = $doctrine;
		$this->logger = $logger;
		
		$this->class = $this->getObjectClass();
	}
	
	protected abstract function buildQuery($qb, $params, $options = null);
	
	protected function getUniqueParamName($col) {
		return str_replace('.', '_', $col).'_'.time().'_'.rand(1000000, 9999999);
	}
	
	protected function getAlias() {
		$obj_class = strtolower($this->getObjectClass());
		
		$index = strrpos($obj_class, "\\");
		if ($index === false) return $obj_class;
		
		return substr($obj_class, $index+1);
	}
	
	protected function getIdColumn() {
		return 'id';
	}
	
	protected function createQueryBuilder() {
		$em = $this->getDoctrineEM();
	
		$objClass = $this->class;
		$alias = $this->getAlias();
		
		$qb = $em->getRepository($objClass)->createQueryBuilder($alias);
	
		return $qb;
	}
	
	protected function isGrantedView($obj) {
		$secu = $this->container->get('security.context');
		//error_log('TEST SINGLE ACCESS SECU : '.get_class($elem));
		if ($secu->isGranted('view', $obj)) return true;
		
		return false;
	}
	
	public function get($id) {
		$em = $this->getDoctrineEM();
		$elem = $em->getRepository($this->class)->find($id);
		if (!$elem) return null;
		if (!$this->isGrantedView($elem)) return null;
		
		return $elem;
	}
	
	public function getAll($options = null) {
		return $this->query(array(), $options);
	}
	
	public function getQueryBuilder($params, $options = null) {
		$qb = $this->createQueryBuilder();
		$qb->where('1 = 1');
		
		$objClass = $this->class;
		$alias = $this->getAlias();
		$id_column = $this->getIdColumn();
		
		$ids_filter = null;
		// On gère ici ce qui est générique.
		if (isset($params['ids']) && $params['ids'] !== false) {
			$ids_filter = $params['ids'];
			unset($params['ids']);
		} else if (isset($params['id']) && $params['id'] !== false) {
			$ids_filter = $params['id'];
			unset($params['id']);
		}
		
		if ($ids_filter) {
			$ids = is_array($ids_filter) ? $ids_filter : array($ids_filter);
				
			$qb->andwhere($alias.'.'.$id_column.' in (:obj_ids___ser)')->setParameter('obj_ids___ser', $ids);
		}
		
		$this->buildQuery($qb, $params, $options);
		
		if ($options && isset($options['force_empty'])) {
			$this->forceQueryFail($qb);
		}
		
		if ($options && isset($options['orderBy'])) {
			$orderBy = $options['orderBy'];
			foreach ($orderBy as $col => $ord) $qb->orderBy($col, $ord);
			//$qb->orderBy($orderBy);
		}
		
		return $qb;
	}
	
	public function query($params, $options = null) {
		$params_orig = $params;
		$options_orig = $options;
		
		$objClass = $this->class;
		$alias = $this->getAlias();
		
		$qb = $this->getQueryBuilder($params, $options);
		
		if ($options && isset($options['count'])) {
			$qb->select('count('.$alias.')');
			return $qb->getQuery()->getSingleScalarResult();
		}
		
		$result = null;
		
		if ($options && isset($options['one'])) {
			$query = $qb->getQuery();
			try {
				$result = $query->getOneOrNullResult();
			} catch (NonUniqueResultException $ex) {
				$res = $query->getResult();
				if ($res) {
					$this->logger->warning(get_class($this).' : query for one result but got '.count($res).' > '.print_r($params_orig, true));
					foreach ($res as $r) {
						$result = $r;
						break;
					}
				}
			}
		} else {
			$must_get_ids_first = false;
			if ($options && isset($options['offset'])) {
				$offset = intval($options['offset']);
				if ($offset >= 0) {
					$must_get_ids_first = true;
					$qb->setFirstResult($offset);
				}
			}
			
			if ($options && isset($options['limit'])) {
				$limit = intval($options['limit']);
				if ($limit > 0) {
					$must_get_ids_first = true;
					$qb->setMaxResults($limit);
				}
			}
			
			if ($must_get_ids_first == true) $qb->distinct();
				
			$query = $qb->getQuery();
			$result = $query->getResult();
		}
		
		$result_type = ($options && isset($options['result_type']) && $options['result_type']) ? $options['result_type'] : 'default';
		
		if ($result_type == 'search_object') {
			// OK on crée un object complet SearchObject
			$searchObject = new SearchObject($objClass, $params_orig, $options_orig, $result);
			
			if ($options && (isset($options['offset']) || isset($options['limit']))) {
				if (!isset($options['cancel_total'])) {
					$count_options = $options_orig;
					unset($count_options['total_rows']);
					if (isset($count_options['offset'])) unset($count_options['offset']);
					if (isset($count_options['limit'])) unset($count_options['limit']);
						
					$count_options['count'] = true;
						
					$total = $this->query($params_orig, $count_options);
						
					$searchObject->setTotalResults($total);
				}
			}
			
			return $searchObject;
		}
		return $result;
	}
	
	protected function getDoctrine() {
		return $this->doctrine;
	}
	
	/**
	 * @return EntityManager
	 */
	public function getDoctrineEM() {
		return $this->doctrine->getManager();
	}
	
	protected function getLogger() {
		return $this->logger;
	}
	
	protected function addWhereFullTextLike($qb, $column, $value) {
		if (!($value)) return false;
		
		$splitted = explode(' ', $value);
		
		$hasValue = false;
		
		$conn = $this->getDoctrineEM()->getConnection();
		
		$counter = rand(100000, 999999);
		
		for ($i = 0; $i < count($splitted); $i++) {
			$val = trim($splitted[$i]);
			if (!$val) continue;
			
			//error_log('TEST searched : '.$val.' >> '.DatabaseUtils::escape($conn, $val));
			
			//$qb->andwhere($column.' like \'%'.DatabaseUtils::escape($conn, $val).'%\'');
			
			$param_uid = time().'_'.($counter++);
			//$qb->andwhere($column." in (:ids_".$param_uid.")")->setParameter('ids_'.$param_uid, $ids);
			$qb->andwhere($column.' like :full_search_'.$param_uid)->setParameter('full_search_'.$param_uid, '%'.$val.'%');
			
			$hasValue = true;
		}
		
		return $hasValue;
	}
	
	protected function addWhereId($qb, $column, $value) {
		if (!($value)) return false;
		
		$ids = $value;
		if (!is_array($ids)) $ids = explode('-', $ids);
		
		if ($ids) {
			$ids = $this->replaceSpecialValuesIds($ids);
			if (!$ids) return false;
			
			$param_uid = time().'_'.rand(10000, 99999);
			$qb->andwhere($column." in (:ids_".$param_uid.")")->setParameter('ids_'.$param_uid, $ids);
			return true;
		}
		return false;
	}
	
	protected function addWhereDate($qb, $column, $value) {
		$value = $this->replaceSpecialValueDate($value);
		
		if (!($value)) return false;
		
		// Il faut qu'on contrôle le type de valeur.
		$dateInfos = DateUtils::getDateInfosFromString($value);
		
		if (!$dateInfos) return false;
		
		$identifier = $this->getUniqueParamName($column);
		
		if (isset($dateInfos['from']) && isset($dateInfos['to'])) {
			$hasParam = false;
			
			// This is from/to
			$from = $dateInfos['from'];
			if ($from['day'] && $from['month'] && $from['year']) {
				$fromStr = $from['year'].'-'.$from['month'].'-'.$from['day'].' 00:00:00';
				
				$this->logger->info("MANAGER FILTER DATE FROM : $fromStr");
				
				$qb->andwhere($column." >= :from_$identifier")->setParameter("from_$identifier", $fromStr);
				$hasParam = true;
			}
			
			$to = $dateInfos['to'];
			if ($to['day'] && $to['month'] && $to['year']) {
				$toStr = $to['year'].'-'.$to['month'].'-'.$to['day'].' 23:59:59';
				$this->logger->info("MANAGER FILTER DATE TO : $toStr");
				$qb->andwhere($column." <= :to_$identifier")->setParameter("to_$identifier", $toStr);
				$hasParam = true;
			}
			
			return $hasParam;
		} else if (isset($dateInfos['day']) && isset($dateInfos['month']) && isset($dateInfos['year']) && $dateInfos['day'] && $dateInfos['month'] && $dateInfos['year']) {
			$date = $dateInfos['year'].'-'.$dateInfos['month'].'-'.$dateInfos['day'];
			
			$fromStr = $date.' 00:00:00';
			$toStr = $date.' 23:59:59';
			
			$qb->andwhere($column." >= :from_$identifier")->setParameter("from_$identifier", $fromStr);
			$qb->andwhere($column." <= :to_$identifier")->setParameter("to_$identifier", $toStr);
			
			return true;
		}
		
		return false;
	}
	
	public function save($obj, $flush = false) {
		if (!$obj) return false;
		
		$this->updateCaches($obj);
		$this->updateListePropertiesCache($obj);
		
		if (method_exists($obj, 'getSaveCounter') && method_exists($obj, 'setSaveCounter')) {
			$orig_counter = $obj->getSaveCounter();
			$counter = 1;
			if ($orig_counter && $orig_counter > 0) $counter = $orig_counter + 1;
			
			$obj->setSaveCounter($counter);
		}
			
		$em = $this->getDoctrineEM();
		$em->persist($obj);
		
		if ($flush) $em->flush();
	}
	
	public function remove($obj, $flush = false) {
		if (!$obj) return false;
	
		$em = $this->getDoctrineEM();
		$em->remove($obj);
	
		if ($flush) $em->flush();
	}
	
	public function refresh($obj) {
		if (!$obj) return;
		
		$em = $this->getDoctrineEM();
		$em->refresh($obj);
	}
	
	public function flush() {
		$em = $this->getDoctrineEM();
		$em->flush();
	}
	
	public function __clone() { trigger_error('Le clônage n\'est pas autorisé.', E_USER_ERROR); }
	
	protected function getValueForSpecialValueId($special_value) {
		return null;
	}
	
	protected function replaceSpecialValuesIds($ids) {
		$orig_is_array = true;
		$arr_ids = $ids;
	
		if (!is_array($ids)) {
			$arr_ids = explode('-', $ids);
			$orig_is_array = false;
		}
	
		// On fait un contrôle pour les valeurs spéciales.
		$ids_real = array();
		foreach ($arr_ids as $id) {
			if (is_string($id)) {
				$str = trim($id);
				if (substr($str, 0, 1) == '{' && substr($str, strlen($str) - 1) == '}') {
					// il s'agit d'une valeur spéciales.
					$val = $this->getValueForSpecialValueId(substr($str, 1, strlen($str) - 2));
					if ($val) $ids_real[] = $val;
				} else {
					$ids_real[] = $id;
				}
			} else {
				$ids_real[] = $id;
			}
		}
		$arr_ids = $ids_real;
	
		if (!$orig_is_array) return implode('-', $arr_ids);
	
		return $arr_ids;
	}
	
	protected function replaceSpecialValueDate($date) {
		if (!$date) return $date;
		
		$str = trim($date);
		if (substr($str, 0, 1) == '{' && substr($str, strlen($str) - 1) == '}') {
			$special_value = substr($str, 1, strlen($str) - 2);
			$pos_moins = strpos($special_value, '-');
			
			$qte = 0;
			if ($pos_moins) {
				$splitted = explode('-', $special_value);
				$type = strtolower($splitted[0]);
				$qte = 0 - intval($splitted[1]);
			} else {
				$splitted = explode('+', $special_value);
				$type = strtolower($splitted[0]);
				$qte = intval($splitted[1]);
			}
			
			$today = date('Y-m-d');
			$splitted = explode('-', $today);
			
			$year = intval($splitted[0]);
			$month = intval($splitted[1]);
			$day = intval($splitted[2]);
			
			error_log('TEST SPECIAL VALUE DATE : '.$type);
			
			if ($type == 'd') {
				$time = mktime(12, 0, 0, $month, $day+$qte, $year);
				$jour = date('Y-m-d', $time);
				return $jour;
			}
			if ($type == 'w') {
				$time = mktime(12, 0, 0, $month, $day+($qte*7), $year);
				$week = date('Y+W', $time);
				return $week;
			}
			if ($type == 'm') {
				$time = mktime(12, 0, 0, $month+$qte, 1, $year);
				$month = date('Y-m', $time);
				return $month;
			}
			if ($type == 'a') {
				return $year+$qte;
			}
		}
			
		return $date;
	}
	
	public function getSearchStringFromParams($params) {
		// Dans un premier temps, on fait un remplacement simple.
		$elems = array();
		foreach ($params as $key => $param) {
			$val = $params[$key];
			if (!$val) continue;
			
			$elem = array('name' => $key, 'value' => $val);
			$elems[] = $elem;
		}
		
		// TODO : traiter les valeurs à remplacer ici.
		
		$str_array = array();
		foreach ($elems as $elem) {
			if (!is_array($elem['value'])) {
				$val = $elem['value'];
				if (is_array($val)) $val = implode('-', $val);
				$str_array[] = $elem['name'].'='.$val;				
			}
		}
		
		return implode(',', $str_array);
	}
}