<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

use Manu\AsgttBundle\Managers\ManagersManager;
class DateTimeFormatter extends SerielListeFormatter
{
	const EXCEL_FORMAT_DATE_TIME = 'JJ.MM.AAAA HH:MM';
	
	public function getCode() {
		return 'date_heure';
	}
	public function format($value) {
		if ($value === null) return '';
		
		if ($value instanceof \DateTime) {
			if ($value->format('H:i') == '00:00') return $value->format('d.m.Y');
			return $value->format('d.m.Y &\a\g\r\a\v\e; H\hi');
		}
		
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
				
				if (!$heure) return date('d.m.Y', mktime(12, 0, 0, $month, $day, $year));
				
				// On travaille l'heure.
				$splitted = explode(':', $heure);
				if (count($splitted) < 2) {
					$splitted = explode('h', $heure);
				}
				
				if (count($splitted) < 2) {
					return date('d.m.Y', mktime(12, 0, 0, $month, $day, $year));
				} else {
					$h = intval($splitted[0]);
					$m = intval($splitted[1]);
					
					return date('d.m.Y &\a\g\r\a\v\e; H\hi', mktime($h, $m, 0, $month, $day, $year));
				}
			}
			
			$splitted = explode('-', $value);
			if (count($splitted) == 2) return DateFormatter::formatMonth($value);
			
			$splitted = explode('+', $value);
			if (count($splitted) == 2) return DateFormatter::formatWeek($value);
		}
		
		return $value;
	}
	
	public function formatEditable($value) {
		$val = '';
	
		if ($value === null) $val = '';
		if ($value instanceof \DateTime) $val = $value->format('Y-m-d H:i');
	
		$templating = ManagersManager::getManager()->getContainer()->get('templating');
	
		return $templating->render('SerielAppliToolboxBundle:Liste/divers:datetime_editable.html.twig', array('value' => $val));
	}
	
	public function getDefaultAlign() {
		return 'center';
	}
	
	public function formatExcel($value) {
		$val = $this->format($value);
		$val = str_replace('&agrave; ', '', $val);
		$val = str_replace('h', ':', $val);
		return $val;
	}
	
	public function getExcelFormatCode() {
		return self::EXCEL_FORMAT_DATE_TIME;
	}
	
	public function getPreferedWidth() {
		return 21;
	}
}