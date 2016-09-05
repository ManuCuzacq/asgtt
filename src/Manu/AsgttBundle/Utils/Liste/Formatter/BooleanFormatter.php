<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

class BooleanFormatter extends SerielListeFormatter
{
	public function getCode() {
		return 'boolean';
	}
	public function format($value) {
		if ($value === null) return '';
		
		if ($value) return 'oui';
		return 'non';
	}
}