<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

class MontantFormatter extends SerielListeFormatter
{
	const EXCEL_FORMAT_MONTANT = '#,##0.00_-€';
	
	public function getCode() {
		return 'montant';
	}
	public function format($value) {
		if ($value === null) return '';
		$value = floatval(str_replace(' ', '', str_replace(',', '.', $value))); 
		
		return number_format($value, 2, '.', '&nbsp;').'&nbsp;&euro;';
	}
	
	public function getDefaultAlign() {
		return 'right';
	}
	
	public function formatExcel($value) {
		return $value;
	}
	
	public function getExcelFormatCode() {
		return self::EXCEL_FORMAT_MONTANT;
	}
	
	public function transformForExcel($val) {
		$val = str_replace('&nbsp;', '', $val);
		$val = str_ireplace("\xC2\xA0", '', $val);
		$val = str_replace(' ', '', $val);
		$val = str_replace(',', '.', $val);
		error_log('TEST MONTANT VAL : '.$val);
		$val = floatval($val);
	
		return $val;
	}
	
	public function getPreferedWidth() {
		return 14;
	}
}