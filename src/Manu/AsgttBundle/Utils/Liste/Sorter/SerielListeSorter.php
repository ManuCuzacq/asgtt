<?php 

namespace Manu\AsgttBundle\Utils\Liste\Sorter;

abstract class SerielListeSorter {
	
	public abstract function getCode();
	public abstract function format($value);
	
	// Can be overwritten
	public function getType() {
		// Par défaut, on trie des chaines de caracteres.
		return 'text';
	}
	
}