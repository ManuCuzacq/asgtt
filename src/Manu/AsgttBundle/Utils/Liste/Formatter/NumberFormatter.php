<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

class NumberFormatter extends SerielListeFormatter
{
	protected $nb_apres_virgule = 2;
	
	public function getCode() {
		return 'number';
	}
	public function format($value) {
		if ($value === null) return '';
		
		$value = floatval(str_replace(',', '.', "".$value));
		$value = number_format($value, 2, '.', '&nbsp;');
		
		// as-ton des chiffres après la virgule ?
		$index = strpos($value, '.');
		if ($index === false) return $value.'&nbsp;%';
		 
		while (substr($value, strlen($value) - 1) == '0') {
			$value = substr($value, 0, strlen($value) - 1);
		}
		 
		if (substr($value, strlen($value) - 1) == '.') $value = substr($value, 0, strlen($value) - 1);
		 
		return $value;
	}
	
	public function transformForExcel($val) {
		$val = str_replace('&nbsp;', '', $val);
		$val = str_replace(' ', '', $val);
		$val = floatval($val);
	
		return $val;
	}
	
	public function getDefaultAlign() {
		return 'center';
	}
}