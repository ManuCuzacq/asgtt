<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

class PercentFormatter extends SerielListeFormatter
{
	public function getCode() {
		return 'percent';
	}
	public function format($value) {
		$value = str_replace(',', '.', "".$value);
		
    	// as-ton des chiffres après la virgule ?
    	$index = strpos($value, '.');
    	if ($index === false) return $value.'&nbsp;%';
    	
    	while (substr($value, strlen($value) - 1) == '0') {
    		$value = substr($value, 0, strlen($value) - 1);
    	}
    	
    	if (substr($value, strlen($value) - 1) == '.') $value = substr($value, 0, strlen($value) - 1);
    	
    	return $value.'&nbsp;%';
	}
	
	public function transformForExcel($val) {
		$val = str_replace('&nbsp;', '', $val);
		$val = str_replace(' ', '');
		$val = floatval($val);
	
		return $val;
	}
	
	public function getDefaultAlign() {
		return 'center';
	}
}