<?php 

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

abstract class SerielListeFormatter {
	
	public abstract function getCode();
	public abstract function format($value);
	
	public function formatEditable($value) {
		// To be overriden.
		return $this->format($value);
	}
	
	// Can be overwritten
	public function getDefaultAlign() {
		return null;
	}
	
	// Can be overwritten
	public function getDefaultVerticalAlign() {
		return null;
	}
	
	// Can be overwritten
	public function formatExcel($value) {
		$val = $this->format($value);
		
		$val = str_replace('&nbsp;', ' ', $val);
		
		return $val;
	}
	
	public function transformForExcel($val) {
		$val = str_replace('&nbsp;', ' ', $val);
	
		return $val;
	}
	
	// Can be overwritten
	public function getExcelFormatCode() {
		return '@';
	}
	
	// Can be overwritten
	public function getPreferedWidth() {
		return null;
	}
	
}