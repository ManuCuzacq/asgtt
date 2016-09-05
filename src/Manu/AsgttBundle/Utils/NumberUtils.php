<?php

namespace Manu\AsgttBundle\Utils;

class NumberUtils {
	
	public static function clearFloat($float) {
		if (!$float) return 0;
		return str_replace(' ', '', str_replace(',', '.', $float));
	}
	
	public static function quantite($qte) {
		$qte = str_replace(',', '.', "".$qte);
		// as-ton des chiffres après la virgule ?
		$index = strpos($qte, '.');
		if ($index === false) return $qte;
		 
		while (substr($qte, strlen($qte) - 1) == '0') {
			$qte = substr($qte, 0, strlen($qte) - 1);
		}
		 
		if (substr($qte, strlen($qte) - 1) == '.') $qte = substr($qte, 0, strlen($qte) - 1);
		 
		return $qte;
	}
	
	public static function duration($duration) {
		$duration_hours = intval($duration/60);
		$duration_minutes = $duration - ($duration * 60);
		 
		$str_minutes = $duration_minutes;
		if (strlen($str_minutes) == 1) $str_minutes = '0'.$str_minutes;
		 
		$dur = $duration_hours.'h'.$str_minutes;
		 
		return $dur;
	}
}