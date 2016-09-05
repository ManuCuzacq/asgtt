<?php

namespace Manu\AsgttBundle\Utils\Liste\Sorter;

class DateSorter extends SerielListeSorter
{
	public function getCode() {
		return 'date';
	}
	public function format($value) {
		if ($value === null) return 'zzzzzzzzzzzzzz';
		
		if ($value instanceof \DateTime) return $value->format('Y-m-d');
		
		if (is_string($value)) {
			// On essaie de splitter.
			$value = trim($value);
			
			$split1 = explode(' ', $value);
			$value = $split1[0];
			
			$splitted = explode('-', $value);
			if (count($splitted) != 3) {
				$splitted = explode('/', $value);
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
				
				return date('Y-m-d', mktime(12, 0, 0, $month, $day, $year));
			}
			
			// Ici, on traite surement des semaine, mois ou annee.
			return $value;
		}
		
		return 'zzzzzzzzzzzzzz';
	}
	
}