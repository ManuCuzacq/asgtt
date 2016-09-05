<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

use Manu\AsgttBundle\Utils\StringUtils;

class TelFormatter extends SerielListeFormatter
{
	public function getCode() {
		return 'tel';
	}
	public function format($value) {
		return StringUtils::nicePhone($value);
	}
	
	public function transformForExcel($val) {
		$val = str_replace('&nbsp;', ' ', $val);
	
		return $val;
	}
	
	public function getDefaultAlign() {
		return 'center';
	}
}