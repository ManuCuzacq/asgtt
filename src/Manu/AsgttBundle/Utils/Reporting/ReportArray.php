<?php

namespace Manu\AsgttBundle\Utils\Reporting;

use Manu\AsgttBundle\Entity\BaseObject;

class ReportArray {
	protected $rows_values = null;
	protected $cols_values = null;
	
	protected $rows_total = null;
	protected $cols_total = null;
	protected $full_total = null;
	
	protected $datas = null;
	
	public function __construct() {
		$this->rows_values = array();
		$this->cols_values = array();
		
		$this->rows_total = array();
		$this->cols_total = array();
		$this->full_total = array();
		
		$this->datas = array();
	}
	
	public function addValue($row_val, $col_val, $data_val, $value, $ratio, $id, $doi) {
		$row_index = $row_val;
		if ($row_val instanceof BaseObject) $row_index = $row_val->getId();
		
		$col_index = $col_val;
		if ($col_val instanceof BaseObject) $col_index = $col_val->getId();
		
		if (!isset($this->datas[$row_index])) $this->datas[$row_index] = array();
		if (!isset($this->datas[$row_index][$col_index])) $this->datas[$row_index][$col_index] = array();
		if (!isset($this->datas[$row_index][$col_index][$data_val])) $this->datas[$row_index][$col_index][$data_val] = array('value' => 0, 'ratio' => 0, 'ids' => array(), 'dois' => array());
		
		if (isset($this->datas[$row_index][$col_index][$data_val]['dois'][$doi])) return;
		
		if (is_object($value)) {
			if (method_exists($value, '__toFloat')) $value = $value->__toFloat();
			if (method_exists($value, '__toInt')) $value = $value->__toInt();
		}
		
		$this->datas[$row_index][$col_index][$data_val]['value'] += $value * $ratio;
		$this->datas[$row_index][$col_index][$data_val]['ratio'] += $ratio;
		
		$this->datas[$row_index][$col_index][$data_val]['ids'][$id] = $id;
		$this->datas[$row_index][$col_index][$data_val]['dois'][$doi] = $doi;
		
		$this->rows_values[$row_index] = $row_val;
		$this->cols_values[$col_index] = $col_val;
	}
	
	public function buildTotals() {
		foreach ($this->datas as $row_index => $datasCols) {
			foreach ($datasCols as $col_index => $datasDts) {
				foreach ($datasDts as $dt_index => $values) {
					// ROW
					if (!isset($this->rows_total[$row_index])) $this->rows_total[$row_index] = array();
					if (!isset($this->rows_total[$row_index][$dt_index])) $this->rows_total[$row_index][$dt_index] = array('value' => 0, 'ratio' => 0, 'ids' => array(), 'dois' => array());
					
					$this->rows_total[$row_index][$dt_index]['value'] += $values['value'];
					$this->rows_total[$row_index][$dt_index]['ratio'] += $values['ratio'];
					$this->rows_total[$row_index][$dt_index]['ids'] = array_merge($this->rows_total[$row_index][$dt_index]['ids'], $values['ids']);
					
					// COL
					if (!isset($this->cols_total[$col_index])) $this->cols_total[$col_index] = array();
					if (!isset($this->cols_total[$col_index][$dt_index])) $this->cols_total[$col_index][$dt_index] = array('value' => 0, 'ratio' => 0, 'ids' => array(), 'dois' => array());
					
					$this->cols_total[$col_index][$dt_index]['value'] += $values['value'];
					$this->cols_total[$col_index][$dt_index]['ratio'] += $values['ratio'];
					$this->cols_total[$col_index][$dt_index]['ids'] = array_merge($this->cols_total[$col_index][$dt_index]['ids'], $values['ids']);
					
					// TOT
					if (!isset($this->full_total[$dt_index])) $this->full_total[$dt_index] = array('value' => 0, 'ratio' => 0, 'ids' => array(), 'dois' => array());
					
					$this->full_total[$dt_index]['value'] += $values['value'];
					$this->full_total[$dt_index]['ratio'] += $values['ratio'];
					$this->full_total[$dt_index]['ids'] = array_merge($this->full_total[$dt_index]['ids'], $values['ids']);
				}
			}
		}
	}
	
	public function getRows() {
		return $this->rows_values;
	}
	
	public function getCols() {
		return $this->cols_values;
	}
	
	public function getValue($row, $col, $data) {
		if (isset($this->datas[$row]) && isset($this->datas[$row][$col]) && isset($this->datas[$row][$col][$data])) return $this->datas[$row][$col][$data]['value'];
		
		return '';
	}
	
	public function getMoyenne($row, $col, $data) {
		if (isset($this->datas[$row]) && isset($this->datas[$row][$col]) && isset($this->datas[$row][$col][$data])) {
			$ratio = $this->datas[$row][$col][$data]['ratio'];
			
			if (!$ratio) return 0;
			return $this->datas[$row][$col][$data]['value'] / $ratio;
		}
	
		return '';
	}
	
	public function getValueTotalRow($row, $data) {
		if (isset($this->rows_total[$row]) && isset($this->rows_total[$row][$data])) return $this->rows_total[$row][$data]['value'];
		
		return '';
	}
	
	public function getMoyenneTotalRow($row, $data) {
		if (isset($this->rows_total[$row]) && isset($this->rows_total[$row][$data])) {
			$ratio = $this->rows_total[$row][$data]['ratio'];
			
			if (!$ratio) return 0;
			return $this->rows_total[$row][$data]['value'] / $ratio;
		}
		return '';
	}
	
	public function getValueTotalCol($col, $data) {
		if (isset($this->cols_total[$col]) && isset($this->cols_total[$col][$data])) return $this->cols_total[$col][$data]['value'];
		
		return '';
	}
	
	public function getMoyenneTotalCol($col, $data) {
		if (isset($this->cols_total[$col]) && isset($this->cols_total[$col][$data])) {
			$ratio = $this->cols_total[$col][$data]['ratio'];
				
			if (!$ratio) return 0;
			return $this->cols_total[$col][$data]['value'] / $ratio;
		}
		return '';
	}
	
	public function getValueFullTotal($data) {
		if (isset($this->full_total[$data])) return $this->full_total[$data]['value'];
		
		return '';
	}
	
	public function getMoyenneFullTotal($data) {
		if (isset($this->full_total[$data])) {
			$ratio = $this->full_total[$data]['ratio'];
	
			if (!$ratio) return 0;
			return $this->full_total[$data]['value'] / $ratio;
		}
		return '';
	}
	
	public function getIds($row, $col, $data) {
		if (isset($this->datas[$row]) && isset($this->datas[$row][$col]) && isset($this->datas[$row][$col][$data])) return $this->datas[$row][$col][$data]['ids'];
	
		return '';
	}
	
	public function getIdsTotalRow($row, $data) {
		if (isset($this->rows_total[$row]) && isset($this->rows_total[$row][$data])) return $this->rows_total[$row][$data]['ids'];
	
		return '';
	}
	
	public function getIdsTotalCol($col, $data) {
		if (isset($this->cols_total[$col]) && isset($this->cols_total[$col][$data])) return $this->cols_total[$col][$data]['ids'];
	
		return '';
	}
	
	public function getIdsFullTotal($data) {
		if (isset($this->full_total[$data])) return $this->full_total[$data]['ids'];
	
		return '';
	}
	
	public function __toString() {
		return print_r($this->datas, true);
	}
}