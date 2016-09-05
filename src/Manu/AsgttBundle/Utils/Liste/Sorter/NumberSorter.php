<?php

namespace Manu\AsgttBundle\Utils\Liste\Sorter;

class NumberSorter extends SerielListeSorter
{
	public function getCode() {
		return 'number';
	}
	public function format($value) {
		return floatval($value);
	}
	
	public function getType() {
		return 'digit';
	}
}