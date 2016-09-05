<?php

namespace Manu\AsgttBundle\Utils\Recherche;

class SearchObject {
	protected $type = null;
	protected $params = null;
	protected $options = null;
	
	protected $col_filters = array();
	protected $col_sort = array();
	
	protected $total_results = -1;
	
	protected $result = null;
	
	public function __construct($type = null, $params = null, $options = null, $result = null) {
		$this->type = $params;
		$this->params = $params;
		$this->options = $options;
		$this->result = $result;
	}
	
	public function setType($type) {
		$this->type = $type;
	}
	public function getType() {
		return $this->type;
	}
	
	public function setParams($params) {
		$this->params = $params;
	}
	public function getParams() {
		return $this->params;
	}
	
	public function setOptions($options) {
		$this->options = $options;
	}
	public function getOptions() {
		return $this->options;
	}
	
	public function setResult($result) {
		$this->result = $result;
	}
	public function getResult() {
		return $this->result;
	}
	
	public function setTotalResults($totalRes) {
		$this->total_results = $totalRes;
	}
	
	public function getTotalResults() {
		if ($this->total_results >= 0)  return $this->total_results;
		return count($this->result);
	}
}