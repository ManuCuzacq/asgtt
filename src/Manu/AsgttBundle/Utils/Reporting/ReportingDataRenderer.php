<?php

namespace Seriel\AppliToolboxBundle\Utils\Reporting;

use Manu\AsgttBundle\Managers\ManagersManager;
use Manu\AsgttBundle\Annotation\SerielReportingColrRowPropertyConverter;
use Manu\AsgttBundle\Utils\Reporting\Optioner\SerielReportingColRowOptioner;
use Manu\AsgttBundle\Annotation\SerielListePropertyConverter;

class ReportingDataRenderer
{
	protected $propertyName;

	protected $method = null;
	protected $label = null;
	protected $label_short = null;
	protected $sort = null;
	protected $format = null;
	protected $moyenne = null;
	protected $align = null;
	protected $credential = null;
	
	protected $container = null;
	protected $templating = null;
	protected $reporting = null;
	
	protected $formatter = null;
	protected $sorter = null;
	
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
	
	public function setLabelShort($labelShort) {
		$this->label_short = $labelShort;
	}
	
	public function getLabelShort() {
		return $this->label_short;
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
	
	public function setMoyenne($moyenne) {
		$this->moyenne = $moyenne;
	}
	
	public function getMoyenne() {
		return $this->moyenne;
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
	
	public function setMethod($method) {
		$this->method = $method;
	}
	
	public function getMethod() {
		return $this->method;
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
	
	public function getValue($obj) {
		if (!$obj) return null;
		
		// Sécurité.
		if ($this->credential) {
			if (!$this->container->get('security.context')->isGranted($this->credential, $obj)) {
				// forbidden return null.
				return null;
			}
		}
		
		$val = $this->evalMethod($obj);
		
		return $val;
	}
	
	public function transformValueForExcel($val) {
		$formatter = $this->formatter;
		if (!$formatter) {
			if (is_object($val)) {
				if ($val instanceof \DateTime) {
					$formatter = $this->reportingMgr->getFormatter('date_heure');
				}
			}
		}
		
		if ($formatter) {
			$val = $formatter->transformForExcel($val);
		}
		
		return $val;
	}
	
	public function getValueAndSortVal($reportArray, $params) {
		if ($params === null) return array('value' => '', 'sort_val' => '');
		
		if (false) $reportArray = new ReportArray();
		
		$row = isset($params['row']) ? $params['row'] : null;
		$col = isset($params['col']) ? $params['col'] : null;
		
		$val = null;
		if ($row !== null && $col !== null) {
			if ($this->moyenne) $val = $reportArray->getMoyenne($row, $col, $this->propertyName);
			else $val = $reportArray->getValue($row, $col, $this->propertyName);
		} else if ($row !== null) {
			if ($this->moyenne) $val = $reportArray->getMoyenneTotalRow($row, $this->propertyName);
			else $val = $reportArray->getValueTotalRow($row, $this->propertyName);
		} else if ($col !== null) {
			if ($this->moyenne) $val = $reportArray->getMoyenneTotalCol($col, $this->propertyName);
			else $val = $reportArray->getValueTotalCol($col, $this->propertyName);
		} else {
			if ($this->moyenne) $val = $reportArray->getMoyenneFullTotal($this->propertyName);
			else $val = $reportArray->getValueFullTotal($this->propertyName);
		}
		
		if ($val === null) return array('value' => '', 'sort_val' => '');
		
		// Actually no need for templating for the moment. We'll see later.
		
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
	
	public function getExcelFormatCode() {
		if ($this->formatter) return $this->formatter->getExcelFormatCode();
		return "@";
	}
}