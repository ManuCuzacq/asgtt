<?php

namespace Manu\AsgttBundle\Utils\Reporting\Optioner;

use Manu\AsgttBundle\Managers\ManagersManager;

class DateTimeOptioner extends SerielReportingColRowOptioner
{
	public function getCode() {
		return 'date_heure';
	}

	public function render($templating = null) {
		if (!$templating) $templating = ManagersManager::getManager()->getContainer()->get('templating');

		return $templating->render('SerielAppliToolboxBundle:Utils/reporting:date_time_optioner.html.twig', array());
	}
	
	private function dateToYearMonthDay($date) {
		if (!$date) return null;
		
		if ($date instanceof \DateTime) {
			$date = $value->format('Y-m-d');
		}
		
		$splitted1 = explode(' ', $date);
		$date = $splitted1[0];
		
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
			
			return array($year, $month, $day);
		}
	}
	
	protected function transformToDay($value, $object) {
		if ($value instanceof \DateTime) return $value->format('Y-m-d');
	
		$yearMonthDay = $this->dateToYearMonthDay($value);
	
		if ($yearMonthDay && count($yearMonthDay) == 3) {
			$year = $yearMonthDay[0];
			$month = $yearMonthDay[1];
			$day = $yearMonthDay[2];
				
			$time = mktime(12, 0, 0, $month, $day, $year);
	
			return date('Y-m-d', $time);
		}
	
		return $value;
	}
	
	protected function transformToWeek($value, $object) {
		if ($value instanceof \DateTime) return $value->format('Y+W');
		
		$yearMonthDay = $this->dateToYearMonthDay($value);
		
		if ($yearMonthDay && count($yearMonthDay) == 3) {
			$year = $yearMonthDay[0];
			$month = $yearMonthDay[1];
			$day = $yearMonthDay[2];
			
			$time = mktime(12, 0, 0, $month, $day, $year);
				
			return date('Y+W', $time);
		}
		
		return $value;
	}
	
	protected function transformToMonth($value, $object) {
		if ($value instanceof \DateTime) return $value->format('Y-m');
		
		$yearMonthDay = $this->dateToYearMonthDay($value);
		
		if ($yearMonthDay && count($yearMonthDay) == 3) {
			$year = $yearMonthDay[0];
			$month = $yearMonthDay[1];
			$day = $yearMonthDay[2];
			
			$time = mktime(12, 0, 0, $month, $day, $year);
				
			return date('Y-m', $time);
		}
	
		return $value;
	}
	
	protected function transformToYear($value, $object) {
		if ($value instanceof \DateTime) return $value->format('Y');
		
		$yearMonthDay = $this->dateToYearMonthDay($value);
	
		if ($yearMonthDay && count($yearMonthDay) == 3) {
			$year = $yearMonthDay[0];
			$month = $yearMonthDay[1];
			$day = $yearMonthDay[2];
				
			$time = mktime(12, 0, 0, $month, $day, $year);
	
			return date('Y', $time);
		}
	
		return $value;
	}
	
	public function transform($value, $object, $option) {
		if (!$value) return $value;
		
		if ($option == 'day') {
			return $this->transformToDay($value, $object);
		} elseif ($option == 'week') {
			return $this->transformToWeek($value, $object);
		} elseif ($option == 'month') {
			return $this->transformToMonth($value, $object);
		} elseif ($option == 'year') {
			return $this->transformToYear($value, $object);
		}
		
		return $value;
	}
	
	public function getJqueryWidgetName() {
		return 'date_heure_reporting_option';
	}
}