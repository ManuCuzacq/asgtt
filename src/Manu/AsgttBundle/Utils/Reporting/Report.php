<?php

namespace Manu\AsgttBundle\Utils\Reporting;

use Seriel\AppliToolboxBundle\Utils\Reporting\ReportingDataRenderer;

class Report {
	protected $datas = null;
	protected $report_array = null;
	
	protected $rowRenderer = null;
	protected $colRenderer = null;
	
	protected $rowSortValuesMap = null;
	protected $colSortValuesMap = null;
	
	protected $datasRenderers = null;
	
	protected $templating = null;
	
	public function __construct($rowRenderer, $colRenderer, $datasRenderers, $templating) {
		$this->rowRenderer = $rowRenderer;
		$this->colRenderer = $colRenderer;
		$this->datasRenderers = $datasRenderers;
		
		$this->rowSortValuesMap = array();
		$this->colSortValuesMap = array();
		
		$this->templating = $templating;
		
		$this->report_array = new ReportArray();
	}
	
	public function setDatas($datas) {
		$this->datas = $datas;
	}
	
	protected function getValFromTwigStr($obj, $twig_str) {
		if ((!$obj) || (!$twig_str)) return '';
		
		$splitted = explode('.', $twig_str);
		
		for ($i = 0; $i < count($splitted) - 1; $i++) {
			$method = 'get'.ucfirst($splitted[$i]);
			eval('$obj = $obj->'.$method.'();');
			if (!$obj) return '';
		}
		
		$method = 'get'.ucfirst($splitted[count($splitted) - 1]);
		$res = '';
		eval('$res = $obj->'.$method.'();');
		
		if (!$res) $res = '';
		return $res;
	}
	
	public function parseDatas() {
		if (!$this->datas) return;
		
		foreach ($this->datas as $data) {
			$id = $data->getId();
			$doi = $data->getDoi();
			
			// On récupère ligne et colonne.
			//$row_val = $this->getValFromTwigStr($data, $this->row);
			$row_values = $this->rowRenderer->renderValueAndSortVal($data);
			$row_val = $row_values['value'];
			$row_sort_val = $row_values['sort_val'];
			if (!$row_sort_val) $row_sort_val = $row_val;
			
			$this->rowSortValuesMap[$row_sort_val] = $row_val;
			
			
			// On récupère les paramètres que l'on souhaite afficher.
			$col_values = $this->colRenderer->renderValueAndSortVal($data);
			$col_val = $col_values['value'];
			$col_sort_val = $col_values['sort_val'];
			if (!$col_sort_val) $col_sort_val = $col_val;
			
			$this->colSortValuesMap[$col_sort_val] = $col_val;
			
			// On s'occupe désormais des données affichées.
			
			// On met la quantité.
			if (isset($this->datasRenderers['qte'])) {
				$this->report_array->addValue($row_val, $col_val, 'qte', 1, 1, $id, $doi);
			}
			foreach ($this->datasRenderers as $name => $renderer) {
				if ($name == 'qte') continue;
				if (false) $renderer = new ReportingDataRenderer();
				$val = $renderer->getValue($data);
				if ($val !== null && $val !== '') {
					$this->report_array->addValue($row_val, $col_val, $name, $val, 1, $id, $doi);
				}
			}
			
		}
		
		$this->buildTotals();
	}
	
	protected function buildTotals() {
		$this->report_array->buildTotals();
	}
	
	public function getRows() {
		//$rows = $this->report_array->getRows();
		
		// On renvoie les valeur triées.
		ksort($this->rowSortValuesMap);
		$res = array();
		foreach (array_values($this->rowSortValuesMap) as $val) {
			$res[$val] = $val;
		}
		return $res;
	}
	
	public function getCols() {
		//$cols = $this->report_array->getCols();
		
		// On renvoie les valeur triées.
		ksort($this->colSortValuesMap);
		$res = array();
		foreach (array_values($this->colSortValuesMap) as $val) {
			$res[$val] = $val;
		}
		return $res;
	}
	
	public function getDatas() {
		$res = array();
		
		foreach ($this->datasRenderers as $name => $renderer) {
			if ($name == 'qte') {
				$res['qte'] = 'Quantité';
				continue;
			}
			
			$res[$name] = $renderer->getLabel();
		}
		
		return $res;
	}
	
	/*public function getValue($row, $col, $data) {
		return $this->report_array->getValue($row, $col, $data);
	}
	
	public function getMoyenne($row, $col, $data) {
		return $this->report_array->getMoyenne($row, $col, $data);
	}
	
	public function getValueTotalRow($row, $data) {
		return $this->report_array->getValueTotalRow($row, $data);
	}
	
	public function getMoyenneTotalRow($row, $data) {
		return $this->report_array->getMoyenneTotalRow($row, $data);
	}
	
	public function getValueTotalCol($col, $data) {
		return $this->report_array->getValueTotalCol($col, $data);
	}
	
	public function getMoyenneTotalCol($col, $data) {
		return $this->report_array->getMoyenneTotalCol($col, $data);
	}
	
	public function getValueFullTotal($data) {
		return $this->report_array->getValueFullTotal($data);
	}
	
	public function getMoyenneFullTotal($data) {
		return $this->report_array->getMoyenneFullTotal($data);
	}*/
	
	public function renderDataColTitle($data) {
		if ($data == 'qte') return 'Quantité';
		
		if (isset($this->datasRenderers[$data])) { // Should always be true
			$renderer = $this->datasRenderers[$data];
			
			$label_short = $renderer->getLabelShort();
			if ($label_short) return $label_short;
			
			$label = $renderer->getLabel();
			if ($label) return $label;
		}
		
		return $this->datas[$data];
	}
	
	public function renderCell($data, $row = null, $col = null) {
		
		$val = null;
		$sort_val = null;
		
		if ($data == 'qte') {
			// Traitement spécial.
			if ($row !== null && $col !== null) $val = $this->report_array->getValue($row, $col, 'qte');
			else if ($row !== null) $val = $this->report_array->getValueTotalRow($row, 'qte');
			else if ($col !== null) $val = $this->report_array->getValueTotalCol($col, 'qte');
			else $val = $this->report_array->getValueFullTotal('qte');
			
			$sort_val = floatval(str_replace(' ', '', $val));
		} else {
			// On récupère le renderer.
			if (isset($this->datasRenderers[$data])) { // Should always be true
				$renderer = $this->datasRenderers[$data];
				
				$params = array();
				if ($row !== null) $params['row'] = $row;
				if ($col !== null) $params['col'] = $col;
				
				$val_and_sort_val = $renderer->getValueAndSortVal($this->report_array, $params);
				
				$val = $val_and_sort_val['value'];
				$sort_val = $val_and_sort_val['sort_val'];
			}
		}
		
		// On récupère les ids.
		$ids = array();
		if ($row !== null && $col !== null) $ids = $this->report_array->getIds($row, $col, $data);
		else if ($row !== null) $ids = $this->report_array->getIdsTotalRow($row, $data);
		else if ($col !== null) $ids = $this->report_array->getIdsTotalCol($col, $data);
		else $ids = $this->report_array->getIdsFullTotal($data);
		
		$template_datas = array('value' => $val, 'sort_val' => $sort_val, 'ids' => $ids);
		if ($row !== null) $template_datas['row'] = $row;
		if ($col !== null) $template_datas['col'] = $col;
		$template_datas['data'] = $data;
		
		return $this->templating->render('SerielAppliToolboxBundle:Reporting:report_cell.html.twig', $template_datas);
	}
	
	public function getIds($row, $col, $data) {
		return $this->report_array->getIds($row, $col, $data);
	}
	
	public function getIdsTotalRow($row, $data) {
		return $this->report_array->getIdsTotalRow($row, $data);
	}
	
	public function getIdsTotalCol($col, $data) {
		return $this->report_array->getIdsTotalCol($col, $data);
	}
	
	public function getIdsFullTotal($data) {
		return $this->report_array->getIdsFullTotal($data);
	}
	
	public function render() {
		return $this->templating->render('SerielAppliToolboxBundle:Reporting:render.html.twig', array('report' => $this));
	}
	
}