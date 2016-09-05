<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Utils\Liste\ListeElemRenderer;
use Manu\AsgttBundle\Annotation\ListeProperty;
use Manu\AsgttBundle\Utils\Liste\Formatter\BooleanFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\MontantFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\DateFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\DateTimeFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\PercentFormatter;
use Manu\AsgttBundle\Utils\Liste\Sorter\NumberSorter;
use Manu\AsgttBundle\Utils\Liste\Sorter\DateSorter;
use Manu\AsgttBundle\Utils\Liste\Sorter\DateTimeSorter;
use Manu\AsgttBundle\Annotation\SerielListePropertyConverter;
use Manu\AsgttBundle\Utils\Liste\Formatter\DurationFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\NumberFormatter;
use Manu\AsgttBundle\Utils\Recherche\SearchObject;
use Manu\AsgttBundle\Utils\Liste\Formatter\TelFormatter;

class ListeManager {
	protected $doctrine = null;
	protected $logger = null;
	protected $templating = null;
	protected $container = null;
	protected $user = null;
	
	protected $formatters = array();
	protected $sorters = array();
	
	protected $_cache_liste_property_renderers = array();
	
	public function __construct($doctrine, $templating, $logger, $container) {
		$this->doctrine = $doctrine;
		$this->templating = $templating;
		$this->logger = $logger;
		$this->container = $container;
		$this->user = $this->container->get('security.context')->getToken()->getUser();
		
		$this->initFormatters();
		$this->initSorters();
	}
	
	protected function initFormatters() {
		$this->addFormatter(new BooleanFormatter());
		$this->addFormatter(new MontantFormatter());
		$this->addFormatter(new DateFormatter());
		$this->addFormatter(new DateTimeFormatter());
		$this->addFormatter(new PercentFormatter());
		$this->addFormatter(new DurationFormatter());
		$this->addFormatter(new NumberFormatter());
		$this->addFormatter(new TelFormatter());
	}
	
	protected function initSorters() {
		$this->addSorter(new NumberSorter());
		$this->addSorter(new DateSorter());
		$this->addSorter(new DateTimeSorter());
	}
	
	protected function addFormatter($formatter) {
		if ($formatter) {
			$this->formatters[$formatter->getCode()] = $formatter;
		}
	}
	
	protected function addSorter($sorter) {
		if ($sorter) {
			$this->sorters[$sorter->getCode()] = $sorter;
		}
	}
	
	public function getFormatter($code) {
		if (!$code) return null;
		if (isset($this->formatters[$code])) return $this->formatters[$code];
		
		return null;
	}
	
	public function getSorter($code) {
		if (!$code) return null;
		if (isset($this->sorters[$code])) return $this->sorters[$code];
	
		return null;
	}
	
	/* protected function buildFieldsRenderer($fields) {
		$renderers = array();
		if ($fields) {
			foreach ($fields as $field) {
				if (false) $field = new ListeProperty();
				
				$renderer = new ListeElemRenderer();
				$renderer->setPropertyName($field->getPropertyName());
				$renderer->setMethod($field->getMethod());
				$renderer->setLabel($field->getLabel());
				$renderer->setFormat($field->getFormat());
				$renderer->setSort($field->getSort());
				$renderer->setAlign($field->getAlign());
				
				$renderers[] = $renderer;
				
				if (strtolower($field->getType()) == 'object') {
					// Il s'agit d'un objet, on essaie de detecter les elements de liste qui se trouvent à l'interieur.
					$objClass = $field->getObjectClass();
					
					if ($objClass) {
						$reader = $this->container->get('annotation_reader');
							
						$converter = new SerielListePropertyConverter($reader);
						$reflected = $converter->convert($this->getObjectClass());
							
						
					}
				}
			}
		}
		
		return $renderers;
	}*/
	
	public static function orderRenderers(ListeElemRenderer $r1, ListeElemRenderer $r2) {
		$group1 = $r1->getGroup();
		$group2 = $r2->getGroup();
	
		$group_cmp = strcmp($group1, $group2);
		if ($group_cmp != 0) return $group_cmp;
	
		$label1 = $r1->getLabel();
		$label2 = $r2->getLabel();
	
		return strcmp($label1, $label2);
	}
	
	public function buildFieldsRenderer($className, &$recursionSecuClassesMap = null) {
		if (!$className) return null;
		
		$must_store_cache = false;
		if ($recursionSecuClassesMap === null) {
			if (isset($this->_cache_liste_property_renderers[$className])) {
				//echo "found cache : $className";
				return $this->_cache_liste_property_renderers[$className];
			}
			
			$must_store_cache = true;
			$recursionSecuClassesMap = array();
		}
		
		//error_log('buildFieldsRenderer : '.$className.' >> '.print_r($recursionSecuClassesMap, true));
		
		//if (isset($recursionSecuClassesMap[$className])) return null;
		
		$reader = $this->container->get('annotation_reader');
		$secuContext = $this->container->get('security.context');
			
		$converter = new SerielListePropertyConverter($reader);
		$fields = $converter->convert($className);
		
		$directChildrenMap = array();
		if ($fields) {
			foreach ($fields as $field) {
				if (false) $field = new ListeProperty();
				if (strtolower($field->getType()) == 'object') {
					$subObjClass = $field->getObjectClass();
					
					if (!isset($recursionSecuClassesMap[$subObjClass])) {
						$directChildrenMap[$subObjClass] = true;
						$recursionSecuClassesMap[$subObjClass] = true;
					}
				}
			}
		}
		
		$recursionSecuClassesMap[$className] = true;
		
		$renderers = array();
		if ($fields) {
			foreach ($fields as $field) {
				if (false) $field = new ListeProperty();
				
				// Securité.
				$cred = $field->getCredential();
				// Si l'utilisateur n'a aucun droit pour ce credential, on ne l'ajoute pas à la liste.
				if ($cred && $this->activeSecurity() && (!$secuContext->isGranted('ANY_RIGHT_ON['.$className.' >> '.$cred.']'))) continue;
	
				$renderer = new ListeElemRenderer();
				$renderer->setPropertyName($field->getPropertyName());
				//$renderer->setMethod($field->getMethod());
				$renderer->setMethod($field->getMethod()."()");
				$renderer->setLabel($field->getLabel());
				//$renderer->setLogo($field->getLogo());
				$logo = $field->getLogo();
				$renderer->setLogo($logo ? $logo."()" : null);
				$classSupp = $field->getClassSupp();
				$renderer->setClassSupp($classSupp ? $classSupp."()" : null);
				$renderer->setFormat($field->getFormat());
				$renderer->setDbfield($field->getDbfield());
				$renderer->setDbfieldformat($field->getDbfieldformat());
				$renderer->setDbfieldsort($field->getDbfieldsort());
				$renderer->setFilter($field->getFilter());
				$renderer->setSort($field->getSort());
				$renderer->setAlign($field->getAlign());
				$renderer->setCredential($cred);
				$renderer->setWidth($field->getWidth());
				
				$renderer->setEditable($field->getEditable());
				$renderer->setEditableUpdateFunc($field->getEditableUpdateFunc());
				
				$group = $className;
				$index = strrpos($group, "\\");
				if ($index !== false) $group = substr($group, $index+1);
				$renderer->setGroup($group);
	
				if (strtolower($field->getType()) == 'object') {
					// On n'affiche pas l'objet car on affiche tous ses éléments
					//$group = $renderer->getLabel();
					//$renderer->setGroup($group);
				} else {
					$renderers[] = $renderer;
				}
				
	
				if (strtolower($field->getType()) == 'object') {
					// Il s'agit d'un objet, on essaie de detecter les elements de liste qui se trouvent à l'interieur.
					$subObjClass = $field->getObjectClass();
					
					if ((!isset($recursionSecuClassesMap[$subObjClass])) || isset($directChildrenMap[$subObjClass])) {
						$foundElems = false;
						if ($subObjClass) {
							$subRenderers = $this->buildFieldsRenderer($subObjClass, $recursionSecuClassesMap);
							if ($subRenderers) {
								$preFix = $field->getObjectPrefix();
								$postFix = $field->getObjectPostfix();
								
								foreach ($subRenderers as $subRend) {
									$propName = $subRend->getPropertyName();
									$subRend->setPropertyName($renderer->getPropertyName().'.'.$propName);
									$group = $subRend->getGroup();
									//$subRend->setGroup($renderer->getGroup().' / '.$group);
									//$subRend->setGroup($renderer->getLabel().' / '.$group);
									$subRend->setGroup($renderer->getGroup().' / '.$renderer->getLabel());
									
									$label = $subRend->getLabel();
									if ($preFix !== null) $subRend->setLabel($preFix.$label);
									else if ($postFix !== null) $subRend->setLabel($label.$postFix);
									else $subRend->setLabel($renderer->getLabel().'/'.$label);
						
									$method = $subRend->getMethod();
									//$subRend->setMethod($renderer->getMethod().'()->'.$method);
									$subRend->setMethod($renderer->getMethod().'->'.$method);
									
									$logo = $subRend->getLogo();
									//if ($logo) $subRend->setLogo($renderer->getMethod().'()->'.$logo);
									if ($logo) $subRend->setLogo($renderer->getMethod().'->'.$logo);
									
									$classSupp = $subRend->getClassSupp();
									if ($classSupp) $subRend->setClassSupp($renderer->getMethod().'->'.$classSupp);
									
									//On traite les db fields.
									$dbfield = $renderer->getDbfield();
									if ($dbfield) {
										$subdbfield = $subRend->getDbfield();
										if ($subdbfield) $subRend->setDbfield($dbfield.'.'.$subdbfield);
										
										$subdbfieldformat = $subRend->getDbfieldformat();
										if ($subdbfieldformat) $subRend->setDbfieldformat($dbfield.'.'.$subdbfieldformat);
										
										$subdbfieldsort = $subRend->getDbfieldsort();
										if ($subdbfieldsort) $subRend->setDbfieldsort($dbfield.'.'.$subdbfieldsort);
									}
									$filter = $renderer->getFilter();
									if ($filter) {
										$subfilter = $subRend->getFilter();
										if ($subfilter) $subRend->setFilter($filter.'.'.$subfilter);
									} else {
										$subfilter = $subRend->getFilter();
										if ($subfilter) $subRend->setFilter(null);
									}
						
									$renderers[] = $subRend;
						
									$foundElems = true;
								}
							}
						}
							
						if ($foundElems == false) {
							$renderers[] = $renderer;
						}						
					}
				}
			}
		}
		
		// Let's order them.
		usort($renderers, array('Manu\AsgttBundle\Managers\ListeManager', 'orderRenderers'));
		
		/*foreach ($renderers as $renderer) {
			error_log("TEST RENDERER : ".$renderer->getGroup().' > '.$renderer->getLabel());
		}*/
		
		if ($must_store_cache) {
			// Let's cache this.
			$this->_cache_liste_property_renderers[$className] = $renderers;
		}
	
		return $renderers;
	}
	
	public function getFields($manager, $user, $context = null) {
		$fields = null;
		$fields_user = $manager->getUserFieldsName($user, $context);
		if ($fields_user) {
			$fields = $fields_user;
		} else {
			$fields = $manager->getDefaultFields();
		}
		
		return $fields;
	}
	
	public function transformJsonToRenderers($json) {
		if (!$json) return array();
		
		$arr = json_decode($json, true);
		
		$renderers = array();
		if ($arr) {
			foreach ($arr as $a) {
				$renderer = new ListeElemRenderer();
				$renderer->buildFromArray($a);
				$renderers[] = $renderer;
			}
		}
		
		return $renderers;
	}
	
	public function transformRenderersToJson($renderers) {
		if (!$renderers) return json_encode("");
		
		$arr = array();
		foreach ($renderers as $renderer) {
			if (false) $renderer = new ListeElemRenderer();
			$arr[] = $renderer->toArray();
		}
		
		return json_encode($arr);
	}
	
	public function render($elements, $refreshInfos = null, $type = null, $options = array()) {
		// What elements do we have here ?
		
		//error_log('TEST 2 CONTEXT : '.print_r($options, true));
		
		if ($elements instanceof SearchObject) {
			$search_params = $elements->getParams();
			$options['search_params'] = $search_params;
			
			$search_options = $elements->getOptions();
			if ($search_options && isset($search_options['force_empty'])) unset ($search_options['force_empty']);
			$options['search_options'] = $search_options;
			
			$options['total'] = $elements->getTotalResults();
			
			$elements = $elements->getResult();
		}
		
		if ($elements !== null && (!is_array($elements))) {
			$elements = array($elements);
		}
		
		if ($refreshInfos == null) $refreshInfos = "";
		
		if ($type == null) {
			// Let's get it from elements in there
			if ($elements) {
				foreach ($elements as $elem) {
					$className = get_class($elem);
					//$index = strrpos($className, "\\");
					//if ($index !== false) $className = substr($className, $index+1);
					//$type = strtolower($className);
					$type = $className;
					break;
				}
			}
		}
		
		if ($this->activeSecurity()) {
			$secu = $this->container->get('security.context');
			
			// On place un élément de sécurité au niveau de l'affichage des listes.
			$authorizedElems = array();
			foreach ($elements as $elem) {
				if ($secu->isGranted('view', $elem)) $authorizedElems[] = $elem;
			}
			
			$elements = $authorizedElems;
		}
		
		$managersMgr = $this->container->get('managers_manager');
		$manager = $managersMgr->getManagerForType($type);
		$className = $manager->getObjectClassForList();
		
		//$fields = $manager->getListFields();
		//$fieldsRenderers = $this->buildFieldsRenderer($fields);
		$fieldsRenderers = $this->buildFieldsRenderer($className);
		$suppRenderers = ($options && isset($options['suppRenderers']) && $options['suppRenderers']) ? $options['suppRenderers'] : array();
		if ($suppRenderers) $fieldsRenderers = array_merge($fieldsRenderers, $suppRenderers);
		
		$context = ($options && isset($options['context']) && $options['context']) ? $options['context'] : null;
		
		$fields = null;
		if ($options && isset($options['columns']) && $options['columns']) {
			$columns = $options['columns'];
			if (is_string($columns)) $columns = explode(',', $columns);
			$fields = $columns;
		}
		
		//error_log('TEST COLUMNS : '.print_r($fields, true));
		
		if (!$fields) $fields = $this->getFields($manager, $this->user, $context);
		if ($fields) {
			// On fait une map des renderers
			$renderersMap = array();
			foreach ($fieldsRenderers as $renderer) {
				$renderersMap[$renderer->getPropertyName()] = $renderer;
			}
			
			$real_renderers = array();
			foreach ($fields as $code) {
				if (isset($renderersMap[$code])) $real_renderers[] = $renderersMap[$code];
			}
			if ($real_renderers) $fieldsRenderers = $real_renderers;
		}
		
		$suppRenderersJson = $this->transformRenderersToJson($suppRenderers);
		
		$options['suppRenderers'] = $suppRenderersJson;
		
		// On ajoute la search_string, juste au cas ou.
		if (isset($options['search_params'])) {
			$search_str = $manager->getSearchStringFromParams($options['search_params']);
			$options['search_str'] = $search_str;
		}
		
		$datas = array('elements' => $elements, 'refreshInfos' => $refreshInfos, 'renderers' => $fieldsRenderers, 'type' => $type, 'options' => $options);
		
		return $this->templating->render('SerielAppliToolboxBundle:Liste:liste.html.twig', $datas);
	}
	
	public function renderElem($elem, $type = null, $fields_user = null, $options = null) {
		if (!$elem) return "";
		
		if ($type == null) {
			$className = get_class($elem);
			//$index = strrpos($className, "\\");
			//if ($index !== false) $className = substr($className, $index+1);
			//$type = strtolower($className);
			$type = $className;
		}
		
		if ($this->activeSecurity()) {
			$secu = $this->container->get('security.context');
				
			// On place un élément de sécurité au niveau de l'affichage des listes.
			if (!$secu->isGranted('view', $elem)) return "";
		}
		
		$managersMgr = $this->container->get('managers_manager');
		$manager = $managersMgr->getManagerForType($type);
		$className = $manager->getObjectClass();
		
		//$fields = $manager->getListFields();
		//$fieldsRenderers = $this->buildFieldsRenderer($fields);
		$fieldsRenderers = $this->buildFieldsRenderer($className);
		$suppRenderers = ($options && isset($options['suppRenderers']) && $options['suppRenderers']) ? $options['suppRenderers'] : array();
		if ($suppRenderers) $fieldsRenderers = array_merge($fieldsRenderers, $suppRenderers);
		
		$context = ($options && isset($options['context']) && $options['context']) ? $options['context'] : null;
		
		$fields = null;
		if ($options && isset($options['columns']) && $options['columns']) {
			$columns = $options['columns'];
			if (is_string($columns)) $columns = explode(',', $columns);
			$fields = $columns;
		}
		
		if (!$fields) $fields = $this->getFields($manager, $this->user, $context);
		if ($fields) {
			// On fait une map des renderers
			$renderersMap = array();
			foreach ($fieldsRenderers as $renderer) {
				$renderersMap[$renderer->getPropertyName()] = $renderer;
			}
				
			$real_renderers = array();
			foreach ($fields as $code) {
				if (isset($renderersMap[$code])) $real_renderers[] = $renderersMap[$code];
			}
			if ($real_renderers) $fieldsRenderers = $real_renderers;
		}
		
		$datas = array('elem' => $elem, 'renderers' => $fieldsRenderers, 'type' => $type, 'options' => $options);
		
		return $this->templating->render('SerielAppliToolboxBundle:Liste:liste_elem.html.twig', $datas);
	}
	
	public function countElemsForListSearch($type, $search_params, $search_options, $context = null) {
		$managersMgr = $this->container->get('managers_manager');
		$manager = $managersMgr->getManagerForType($type);
		$className = $manager->getObjectClass();
		
		if (!$search_params === null) $search_params = array();
		
		if ($search_options === null) $search_options = array();
		$search_options['count'] = true;
		
		// On lance la requête.
		return $manager->query($search_params, $search_options);
	}
	
	public function getElemsForListSearch($type, $search_params, $search_options, $resfresh_infos = array(), $ids = null) {
		$managersMgr = $this->container->get('managers_manager');
		$manager = $managersMgr->getManagerForType($type);
		$className = $manager->getObjectClass();
		
		if (!$search_params === null) $search_params = array();
		
		if ($ids) $search_params['ids'] = $ids;
		
		if (isset($resfresh_infos['extraFilters'])) {
			// OK, on reconstruit le search_params.
			$extra_params = $manager->getSearchParamsFromRequest($resfresh_infos['extraFilters']);
			foreach ($extra_params as $key => $value) {
				$search_params[$key] = $value;
			}
		}
		
		if ($search_options === null) $search_options = array();
		$search_options['result_type'] = 'search_object';
		
		// On lance la requête.
		$elems = $manager->query($search_params, $search_options);
		
		return $elems;
	}
	
	public function renderElemsForListSearch($type, $search_params, $search_options, $context, $ids = null) {
		$count = $this->countElemsForListSearch($type, $search_params, $search_options, $context);
		$search_object = $this->getElemsForListSearch($type, $search_params, $search_options, $context, $ids);
		if (false) $search_object = new SearchObject();
		$elems = $search_object->getResult();
		
		//error_log('results refresh elems : '.count($ids).' >> '.count($elems));
		
		return $this->templating->render('SerielAppliToolboxBundle:Liste:elems_for_list_search.html.twig', array('elems' => $elems, 'type' => $type, 'context' => $context, 'count' => $count));
	}
	
	public function activeSecurity() {
		return false;
		//return true;
	}
	
	public function getListeContextForId($context_id) {
		$em = $this->doctrine->getEntityManager();
		return $em->getRepository('SerielAppliToolboxBundle:ListeContext')->find($context_id);
	}
	
	public function getListeContextForCode($code) {
		$em = $this->doctrine->getEntityManager();
		$contexts = $em->getRepository('SerielAppliToolboxBundle:ListeContext')->findBy(array('code' => $code));
		
		if ($contexts) {
			foreach ($contexts as $context) return $context;
		}
		
		return null;
	}
	
	public function getAllListeContexts() {
		$em = $this->doctrine->getEntityManager();
		return $em->getRepository('SerielAppliToolboxBundle:ListeContext')->findAll();
	}
}