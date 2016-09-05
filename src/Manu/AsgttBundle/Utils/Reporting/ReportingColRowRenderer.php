<?php

namespace Manu\AsgttBundle\Utils\Reporting;

use Manu\AsgttBundle\Managers\ManagersManager;
use Manu\AsgttBundle\Annotation\SerielReportingColrRowPropertyConverter;
use Manu\AsgttBundle\Utils\Reporting\Optioner\SerielReportingColRowOptioner;

class ReportingColRowRenderer
{
	protected $propertyName;

	protected $method = null;
	protected $label = null;
	protected $sort = null;
	protected $format = null;
	protected $option = null;
	protected $align = null;
	protected $credential = null;
	protected $group = null;
	
	protected $container = null;
	protected $templating = null;
	protected $reporting = null;
	
	protected $formatter = null;
	protected $sorter = null;
	protected $optioner = null;
	
	protected $option_value = null;
	
	public function __construct() {
		$this->container = ManagersManager::getManager()->getContainer();
		$this->templating = $this->container->get('templating');
		$this->reportingMgr = $this->container->get('reporting_manager');
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
	
	public function setSort($sort) {
		$this->sort = $sort;
		
		// On essaie de charger le sorter.
		$this->sorter = $this->reportingMgr->getSorter($this->sort);
	}
	
	public function getSort() {
		return $this->sort;
	}
	
	public function setFormat($format) {
		$this->format = $format;
		
		// On essaie de charger le formatter.
		$this->formatter = $this->reportingMgr->getFormatter($this->format);
	}
	
	public function getFormat() {
		return $this->format;
	}
	
	public function setOption($option) {
		$this->option = $option;
	
		// On essaie de charger le gestionnaire d'option.
		$this->optioner = $this->reportingMgr->getOptioner($this->option);
	}
	
	public function getOption() {
		return $this->option;
	}
	
	public function setOptionValue($val) {
		$this->option_value = $val;
	}
	
	public function getOptionValue() {
		return $this->option_value;
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
	
	public function setMethod($method) {
		$this->method = $method;
	}
	
	public function getMethod() {
		return $this->method;
	}
	
	public function renderSelectOption($templating = null) {
		if (!$templating) $templating = $this->templating;
		
		return $templating->render('SerielAppliToolboxBundle:Reporting:reporting_col_row_select_option.html.twig', array('code' => $this->getPropertyName(), 'label' => $this->getLabel()));
	}
	
	public function renderOptionsBlock($templating = null) {
		if (!$templating) $templating = $this->templating;
		if ($this->optioner) return $this->optioner->render($templating);
		return "";
	}
	
	public function getOptionsWidget() {
		if ($this->optioner) return $this->optioner->getJqueryWidgetName();
		
		return null;
	}
	
	protected function evalMethod($obj) {
		$methods = explode('()->', $this->method);
		if ($methods) {
			for ($i = 0; $i < count($methods); $i++) {
				if (!$obj) return null;
				$method = $methods[$i];
				//if (substr($method, strlen($method) - 2) != '()') $method .= '()';
				eval('$obj = $obj->'.$method.'();');
			}
			return $obj;
		}
		return null;
	}
	
	/*public function render($obj, $templating = null) {
		if (!$templating) $templating = $this->templating;
		// Actually no need for templating for the moment. We'll see later.
		$val = null;
		$val = $this->evalMethod($obj);
		
		if ($this->optioner && $this->option_value) {
			$val = $this->optioner->transform($val, $obj, $this->option_value);
		}
		
		$align = $this->getAlign();
		
		$formatter = $this->formatter;
		if (!$formatter) {
			if (is_object($val)) {
				if ($val instanceof \DateTime) {
					$formatter = $this->reportingMgr->getFormatter('date_heure');
				}
			}
		}
		
		if ($formatter) {
			$val = $formatter->format($val);
			if ($align == null) $align = $formatter->getDefaultAlign();
		} else {
			if (is_object($val)) {
				$val = ''.$val;
			}
		}
		
		return $templating->render('SerielAppliToolboxBundle:Utils/reporting:col_row_render.html.twig', array('value' => $val, 'align' => $align));
	}
	
	public function renderSortVal($obj, $templating = null) {
		if (!$templating) $templating = $this->templating;
		
		
	}*/
	
	public function renderValueAndSortVal($obj, $templating = null) {
		if (!$templating) $templating = $this->templating;
		
		// Actually no need for templating for the moment. We'll see later.
		$val = null;
		$val = $this->evalMethod($obj);
		
		if ($this->optioner && $this->option_value) {
			$val = $this->optioner->transform($val, $obj, $this->option_value);
		}
		
		$sort_val = null;
		
		$sorter = $this->sorter;
		if ($sorter) {
			$sort_val = $sorter->format($val);
		}
		
		$align = $this->getAlign();
		
		$formatter = $this->formatter;
		if (!$formatter) {
			if (is_object($val)) {
				if ($val instanceof \DateTime) {
					$formatter = $this->reportingMgr->getFormatter('date_heure');
				}
			}
		}
		
		if ($formatter) {
			$val = $formatter->format($val);
			if ($align == null) $align = $formatter->getDefaultAlign();
		} else {
			if (is_object($val)) {
				$val = ''.$val;
			}
		}
		
		if (!$sort_val) $sort_val = $val;
		
		//$value = $templating->render('SerielAppliToolboxBundle:Utils/reporting:col_row_render.html.twig', array('value' => $val, 'align' => $align));
		
		//return array('value' => $value, 'sort_val' => $sort_val);
		
		return array('value' => $val, 'sort_val' => $sort_val);
	}
	
	/*public function render($obj, $templating = null) {
		if (!$obj) return;
		
		if (!$templating) $templating = $this->templating;
		
		$val = null;
		eval('$val = $obj->'.$this->method.'();');
		
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
					$formatter = $this->reportingMgr->getFormatter('date_heure');
				}
			}
		}
		
		if ($formatter) {
			$val = $formatter->format($val);
			if ($align == null) $align = $formatter->getDefaultAlign();
		} else {
			if (is_object($val)) {
				$val = ''.$val;
			}
		}
		
		return $templating->render('SerielAppliToolboxBundle:Liste:liste_elem_render.html.twig', array('value' => $val, 'align' => $align, 'sort_val' => $sort_val));
	}*/
}