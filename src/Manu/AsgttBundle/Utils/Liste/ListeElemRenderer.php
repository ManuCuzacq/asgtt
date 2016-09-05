<?php

namespace Manu\AsgttBundle\Utils\Liste;

use Manu\AsgttBundle\Managers\ManagersManager;

class ListeElemRenderer
{
	protected $propertyName;

	protected $method = null;
	protected $label = null;
	protected $logo = null;
	protected $class_supp = null;
	protected $sort = null;
	protected $format = null;
	protected $dbfield = null;
	protected $dbfieldformat = null;
	protected $dbfieldsort = null;
	protected $filter = null;
	protected $align = null;
	protected $credential = null;
	protected $group = null;
	protected $width = null;
	protected $twigName = null;
	
	protected $container = null;
	protected $templating = null;
	protected $listeMgr = null;
	
	protected $formatter = null;
	protected $sorter = null;
	
	protected $editable = null;
	protected $editableUpdateFunc = null;
	
	public function __construct() {
		$this->container = ManagersManager::getManager()->getContainer();
		$this->templating = $this->container->get('templating');
		$this->listeMgr = $this->container->get('liste_manager');
	}
	
	public function setPropertyName($propertyName) {
		$this->propertyName = $propertyName;
	}
	
	public function getPropertyName() {
		return $this->propertyName;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLogo($logo) {
		$this->logo = $logo;
	}
	
	public function getLogo() {
		return $this->logo;
	}
	
	public function setClassSupp($class_supp) {
		$this->class_supp = $class_supp;
	}
	
	public function getClassSupp() {
		return $this->class_supp;
	}
	
	public function setSort($sort) {
		$this->sort = $sort;
		
		// On essaie de charger le sorter.
		$this->sorter = $this->listeMgr->getSorter($this->sort);
	}
	
	public function getSort() {
		return $this->sort;
	}
	
	public function setFormat($format) {
		$this->format = $format;
		
		// On essaie de charger le formatter.
		$this->formatter = $this->listeMgr->getFormatter($this->format);
	}
	
	public function getFormat() {
		return $this->format;
	}
	
	public function setDbfield($dbfield) {
		$this->dbfield = $dbfield;
	}
	
	public function getDbfield() {
		return $this->dbfield;
	}
	
	public function setDbfieldformat($dbfieldformat) {
		$this->dbfieldformat = $dbfieldformat;
	}
	public function getDbfieldformat() {
		return $this->dbfieldformat;
	}
	
	public function setDbfieldsort($dbfieldsort) {
		$this->dbfieldsort = $dbfieldsort;
	}
	public function getDbfieldsort() {
		return $this->dbfieldsort;
	}
	
	public function setFilter($filter) {
		$this->filter = $filter;
	}
	
	public function getFilter() {
		return $this->filter;
	}
	
	public function setAlign($align) {
		$this->align = $align;
	}
	
	public function getAlign() {
		return $this->align;
	}
	
	public function setCredential($credential) {
		$this->credential = $credential;
	}
	
	public function getCredential() {
		return $this->credential;
	}
	
	public function setGroup($group) {
		$this->group = $group;
	}
	
	public function getGroup() {
		return $this->group;
	}
	
	public function getGroupNiceName() {
		$index = strpos($this->group, "/");
		if ($index !== false) return substr($this->group, $index+1);
		return $this->group;
	}
	
	public function setWidth($width) {
		$this->width = $width;
	}
	
	public function getWidth() {
		return $this->width;
	}
	
	public function setMethod($method) {
		$this->method = $method;
	}
	
	public function getMethod() {
		return $this->method;
	}
	
	public function setEditable($editable) {
		$this->editable = $editable;
	}
	public function getEditable() {
		return $this->editable;
	}
	
	public function setEditableUpdateFunc($editableUpdateFunc) {
		$this->editableUpdateFunc = $editableUpdateFunc;
	}
	public function getEditableUpdateFunc() {
		return $this->editableUpdateFunc;
	}
	
	public function isEditable($obj = null) {
		if ($this->editable === true) return true;
		if ($this->editable) {
			// Il s'agit d'une méthode.
			if ($obj) {
				$can_edit = false;
				eval('$can_edit = $obj->'.$this->editable.";");
				return $can_edit;
			}
		}
		return false;
	}
	
	public function renderHead($templating = null) {
		if (!$templating) $templating = $this->templating;
		
		$sort_type = 'text'; // Par défaut, on trie des chaines de caracteres.
		
		$sorter = $this->sorter;
		if ($sorter) {
			$sort_type = $sorter->getType();
		}
		
		return $templating->render('SerielAppliToolboxBundle:Liste:liste_elem_head_render.html.twig', array('code' => $this->getPropertyName(), 'label' => $this->getLabel(), 'sort_type' => $sort_type, 'dbfield' => $this->dbfield, 'dbfieldformat' => $this->dbfieldformat, 'dbfieldsort' => $this->dbfieldsort, 'filter' => $this->filter));
	}
	
	protected function evalMethod($obj) {
		//$methods = explode('()->', $this->method);
		$methods = explode('->', $this->method);
		if ($methods) {
			for ($i = 0; $i < count($methods); $i++) {
				if (!$obj) return null;
				$method = $methods[$i];
				$method = html_entity_decode($method);
				//if (substr($method, strlen($method) - 2) != '()') $method .= '()';
				//error_log('TEST : $obj = $obj->'.$method.';');
				eval('$obj = $obj->'.$method.';');
			}
			return $obj;
		}
		return null;
	}
	
	protected function evalLogo($obj) {
		if (!$this->logo) return null;
		
		//$methods = explode('()->', $this->logo);
		$methods = explode('->', $this->logo);
		if ($methods) {
			for ($i = 0; $i < count($methods); $i++) {
				if (!$obj) return null;
				$method = $methods[$i];
				//if (substr($method, strlen($method) - 2) != '()') $method .= '()';
				//eval('$obj = $obj->'.$method.'();');
				eval('$obj = $obj->'.$method.';');
			}
			return $obj;
		}
		return null;
	}
	
	protected function evalClassSupp($obj) {
		if (!$this->class_supp) return null;
	
		//$methods = explode('()->', $this->class_supp);
		$methods = explode('->', $this->class_supp);
		if ($methods) {
			for ($i = 0; $i < count($methods); $i++) {
				if (!$obj) return null;
				$method = $methods[$i];
				//if (substr($method, strlen($method) - 2) != '()') $method .= '()';
				//eval('$obj = $obj->'.$method.'();');
				eval('$obj = $obj->'.$method.';');
			}
			return $obj;
		}
		return null;
	}
	
	public function getValue($obj) {
		return $this->evalMethod($obj);
	}
	
	public function getValueFormatted($obj) {
		$val = $this->evalMethod($obj);
		
		$formatter = $this->formatter;
		if (!$formatter) {
			if (is_object($val)) {
				if ($val instanceof \DateTime) {
					$formatter = $this->listeMgr->getFormatter('date_heure');
				}
			}
		}
		
		if ($formatter) {
			$val = $formatter->format($val);
		} else {
			if (is_object($val)) {
				$val = ''.$val;
			}
		}
		
		return $val;
	}
	
	public function getValueSorted($obj) {
		$val = $this->evalMethod($obj);
		
		$sorter = $this->sorter;
		
		$sort_val = null;
		if ($sorter) {
			$sort_val = $sorter->format($val);
		}
		
		return $sort_val;
	}
	
	public function getValuesFormattedAndSorted($obj) {
		$val = $this->evalMethod($obj);
		
		$sorter = $this->sorter;
		if ($sorter) {
			$sort_val = $sorter->format($val);
		}
		
		$formatter = $this->formatter;
		if (!$formatter) {
			if (is_object($val)) {
				if ($val instanceof \DateTime) {
					$formatter = $this->listeMgr->getFormatter('date_heure');
				}
			}
		}
		
		if ($formatter) {
			$val = $formatter->format($val);
		} else {
			if (is_object($val)) {
				$val = ''.$val;
			}
		}
		
		return array($val, $sort_val);
	}
	
	public function render($obj, $templating = null) {
		if (!$obj) return;
		
		if (!$templating) $templating = $this->templating;
		
		// Sécurité.
		if ($this->credential && $this->listeMgr->activeSecurity()) {
			if (!$this->container->get('security.context')->isGranted($this->credential, $obj)) {
				// TODO : show forbidden.
				return $templating->render('SerielAppliToolboxBundle:Liste:liste_elem_render.html.twig', array('forbidden' => true));
			}
		}
		
		$val = null;
		$val = $this->evalMethod($obj);

		$logo = null;
		if ($this->logo) $logo = $this->evalLogo($obj);
		
		$class_supp = null;
		if ($this->class_supp) $class_supp = $this->evalClassSupp($obj);
		
		$sort_val = null;
		
		$sorter = $this->sorter;
		if ($sorter) {
			$sort_val = $sorter->format($val);
		}
		
		$align = $this->align;
		
		$formatter = $this->formatter;
		if (!$formatter) {
			if (is_object($val)) {
				if ($val instanceof \DateTime) {
					$formatter = $this->listeMgr->getFormatter('date_heure');
				}
			}
		}
		
		$editable = $this->isEditable($obj);
		$valEditable = null;
		$editable_widget = null;
		
		if ($formatter) {
			if ($editable) {
				$valEditable = $formatter->formatEditable($val);
				$editable_widget = 'ser_listeEditable_'.$formatter->getCode();
			}
			
			$val = $formatter->format($val);
			if ($align == null) $align = $formatter->getDefaultAlign();
		} else {
			if (is_object($val)) {
				$val = ''.$val;
			}
		}
		
		$datas = array('value' => $val, 'align' => $align, 'sort_val' => $sort_val, 'logo' => $logo, 'class_supp' => $class_supp);
		if ($editable) $datas['editable'] = $editable;
		if ($valEditable) $datas['valEditable'] = $valEditable;
		if ($editable_widget) $datas['editable_widget'] = $editable_widget;
		
		return $templating->render('SerielAppliToolboxBundle:Liste:liste_elem_render.html.twig', $datas);
	}
	
	public function renderExcel($obj) {
		if (!$obj) return '';
		
		$val = null;
		$val = $this->evalMethod($obj);
		
		if (!$val instanceof \DateTime) error_log('TEST RENDER EXCEL : '.$this->propertyName.' >> '.$this->method.' >> '.$val);
		
		$formatter = $this->formatter;
		if (!$formatter) {
			if (is_object($val)) {
				if ($val instanceof \DateTime) {
					$formatter = $this->listeMgr->getFormatter('date_heure');
				}
			}
		}
		
		if ($formatter) {
			$val = $formatter->formatExcel($val);
		} else {
			if (is_object($val)) {
				$val = ''.$val;
			}
		}
		
		return $val;
	}
	public function getExcelFormatCode() {
		$formatter = $this->formatter;
		
		if ($formatter) {
			return $formatter->getExcelFormatCode();
		}
		
		return '@';
	}
	
	public function getPreferedWidth() {
		if ($this->width) return $this->width;
		
		$formatter = $this->formatter;
		
		if ($formatter) {
			return $formatter->getPreferedWidth();
		}
		
		return null;
	}
	
	public function getAlignement() {
		if ($this->align) return $this->align;
		
		$formatter = $this->formatter;
		
		if ($formatter) {
			return $formatter->getDefaultAlign();
		}
		
		return null;
	}
	
	public function toArray() {
		$arr = array();
		
		$arr['propertyName'] = $this->propertyName;
		$arr['method'] = $this->method;
		$arr['label'] = $this->label;
		$arr['logo'] = $this->logo;
		$arr['class_supp'] = $this->class_supp;
		$arr['sort'] = $this->sort;
		$arr['format'] = $this->format;
		$arr['dbfield'] = $this->dbfield;
		$arr['dbfieldformat'] = $this->dbfieldformat;
		$arr['dbfieldsort'] = $this->dbfieldsort;
		$arr['filter'] = $this->filter;
		$arr['align'] = $this->align;
		$arr['credential'] = $this->credential;
		$arr['group'] = $this->group;
		$arr['width'] = $this->width;
		$arr['twigName'] = $this->twigName;
		$arr['editable'] = $this->editable;
		$arr['editableUpdateFunc'] = $this->editableUpdateFunc;
		
		return $arr;
	}
	
	public function buildFromArray($arr) {
		$this->propertyName = $arr['propertyName'];
		$this->method = $arr['method'];
		$this->label = $arr['label'];
		$this->logo = $arr['logo'];
		$this->class_sup = $arr['class_supp'];
		$this->sort = $arr['sort'];
		$this->format = $arr['format'];
		$this->dbfield = $arr['dbfield'];
		$this->dbfieldformat = $arr['dbfieldformat'];
		$this->dbfieldsort = $arr['dbfieldsort'];
		$this->filter = $arr['filter'];
		$this->align = $arr['align'];
		$this->credential = $arr['credential'];
		$this->group = $arr['group'];
		$this->width = $arr['width'];
		$this->twigName = $arr['twigName'];
		$this->editable = $arr['editable'];
		$this->editableUpdateFunc = $arr['editableUpdateFunc'];
	}
}