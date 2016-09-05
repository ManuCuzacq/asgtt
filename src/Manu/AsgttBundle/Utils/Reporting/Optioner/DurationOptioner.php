<?php

namespace Manu\AsgttBundle\Utils\Reporting\Optioner;

use Manu\AsgttBundle\Managers\ManagersManager;
use Manu\AsgttBundle\Utils\Data\Duration;

class DurationOptioner extends SerielReportingColRowOptioner
{
	public function getCode() {
		return 'duration';
	}

	public function render($templating = null) {
		if (!$templating) $templating = ManagersManager::getManager()->getContainer()->get('templating');

		return $templating->render('SerielAppliToolboxBundle:Utils/reporting:duration_optioner.html.twig', array());
	}
	
	public function transform($value, $object, $option) {
		if ($value === null) return $value;
		
		if ($value instanceof Duration) {
			if ($option == 'minutes') {
				$minutes = $value->getDurationInMinutes();
				return floor(intval($minutes)).'m';
			} elseif ($option == 'hours') {
				$hours = $value->getDurationInHours();
				return floor(intval($hours)).'h';
			} elseif ($option == 'days') {
				$days = $value->getDurationInDays();
				return floor(intval($days)).'j';
			} elseif ($option == 'weeks') {
				$weeks = $value->getDurationInWeeks();
				return floor(intval($weeks)).'s';
			}
		}
		
		if ($option == 'minutes') {
			return floor(intval($value)).'m';
		} elseif ($option == 'hours') {
			return floor($value/60).'h';
		} elseif ($option == 'days') {
			return floor($value/60/Duration::HOURS_BY_DAY).'j';
		}
		
		return $value;
	}
	
	public function getJqueryWidgetName() {
		return 'duration_reporting_option';
	}
}