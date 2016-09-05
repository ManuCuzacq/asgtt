<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

use Manu\AsgttBundle\Utils\DateUtils;
use Manu\AsgttBundle\Managers\ManagersManager;

class DateFormatter extends SerielListeFormatter
{
	public function getCode() {
		return 'date';
	}
	public function format($value) {
		if ($value === null) return '';
		
		if ($value instanceof \DateTime) return $value->format('d.m.Y');
		
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
				
				return date('d.m.Y', mktime(12, 0, 0, $month, $day, $year));
			}
			
			$splitted = explode('-', $value);
			if (count($splitted) == 2) return self::formatMonth($value);
			
			$splitted = explode('+', $value);
			if (count($splitted) == 2) return self::formatWeek($value);
		}
		
		return $value;
	}
	
	public function formatEditable($value) {
		$val = '';
		
		if ($value === null) $val = '';
		if ($value instanceof \DateTime) $val = $value->format('Y-m-d');
		
		$templating = ManagersManager::getManager()->getContainer()->get('templating');
		
		return $templating->render('SerielAppliToolboxBundle:Liste/divers:date_editable.html.twig', array('value' => $val));
	}
	
	public static function formatWeek($week) {
		$splitted = explode('+', $week);
		if (count($splitted) == 2) {
			$year = $splitted[0];
			$week = intval($splitted[1]);
			
			return "semaine $week de $year";
		}
		return $week;
	}
	public static function formatMonth($month) {
		$splitted = explode('-', $month);
		if (count($splitted) == 2) {
			$year = $splitted[0];
			$mois = intval($splitted[1]);
			$mois_str = DateUtils::getMonth($mois);
			
			return $mois_str.' '.$year;
		}
		
		return $month;
	}
	
	public function getDefaultAlign() {
		return 'center';
	}
}