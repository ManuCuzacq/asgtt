<?php

namespace Manu\AsgttBundle\Utils\Liste\Sorter;

class DateTimeSorter extends SerielListeSorter
{
	public function getCode() {
		return 'date_heure';
	}
	public function format($value) {
		if ($value === null) return 'zzzzzzzzzzzzzz';
		
		if ($value instanceof \DateTime) return $value->format('Y-m-d H:i');
		
		if (is_string($value)) {
			// On essaie de splitter.
			$value = trim($value);
			
			$date = null;
			$heure = null;
			
			$splitted1 = explode(' ', $value);
			if (count($splitted1) >= 2) {
				$date = $splitted1[0];
				$heure = $splitted1[1];
			} else {
				$date = $splitted1[0];
			}
			
			$splitted = explode('-', $date);
			if (count($splitted) != 3) {
				$splitted = explode('/', $date);
			}
			
			if (count($splitted) == 3) {
				$year = null;
				$month = null;
				$day = null;
				
				// A-t-on l'année à la fin ?
				if (strlen($splitted[2]) == 4) {
					$year = $splitted[2];
					$month = $splitted[1];
					$day = $splitted[0];
				} else {
					$year = $splitted[0];
					$month = $splitted[1];
					$day = $splitted[2];
					
					if (strlen($year) == 2) {
						if (intval($year) > 80) $year = '19'.$year;
						else $year = '20'.$year;
					}
				}
				
				if (!$heure) return date('Y-m-d', mktime(12, 0, 0, $month, $day, $year));
				
				// On travaille l'heure.
				$splitted = explode(':', $heure);
				if (count($splitted) < 2) {
					$splitted = explode('h', $heure);
				}
				
				if (count($splitted) < 2) {
					return date('Y-m-d', mktime(12, 0, 0, $month, $day, $year));
				} else {
					$h = intval($splitted[0]);
					$m = intval($splitted[1]);
					
					return date('Y-m-d H:i', mktime($h, $m, 0, $month, $day, $year));
				}
			}
			
			// Ici, on traite surement des semaine, mois ou annee.
			return $value;
		}
		
		return 'zzzzzzzzzzzzzz';
	}
	
}