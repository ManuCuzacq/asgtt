<?php

namespace Manu\AsgttBundle\Utils\Liste\Formatter;

use Manu\AsgttBundle\Utils\Data\Duration;

class DurationFormatter extends SerielListeFormatter
{
	protected $max_minutes = 60;
	protected $max_hours = 15;
	protected $max_days = 10;
	
	public function getCode() {
		return 'duration';
	}
	public function format($value) {
		if ($value === null) return '';
		
		if (is_string($value)) {
			$lastChar = substr($value, strlen($value) - 1);
			$val = intval(substr($value, 0, strlen($value) - 1));
			
			if ($lastChar == 'm') {
				if ($val == 0) return ('moins de 1 minute');
				else if ($val < $this->max_minutes) return $val.' &agrave; '.($val+1).' minutes';
				else return 'plus de '.$this->max_minutes.' minutes';
			}
			
			if ($lastChar == 'h') {
				if ($val == 0) return ('moins de 1 heure');
				else if ($val < $this->max_hours) return $val.' &agrave; '.($val+1).' heures';
				else return 'plus de '.$this->max_hours.' heures';
			}
			
			if ($lastChar == 'j') {
				if ($val == 0) return ('moins de 1 jour');
				else if ($val < $this->max_days) return $val.' &agrave; '.($val+1).' jours';
				else return 'plus de '.$this->max_days.' jours';
			}
		}
		
		if ($value instanceof Duration) {
			return $value->niceShortDuration();
		}
		
		
		//error_log("TEST DURATION VALUE : $value > $lastChar > $val");
		
		// On fomatte correctement.
		$value = round($value);
		
		$jours = 0;

		$mins = $value%60;
		$hours = intval($value/60);
		if ($hours) {
			$jours = intval($hours/Duration::HOURS_BY_DAY);
			if ($jours) {
				$hours = intval($hours%Duration::HOURS_BY_DAY);
			}
		}
		
		
		
		if ($hours == 0 && $jours == 0) {
			return $mins.'&nbsp;mn';
		} else if ($jours == 0) {
			$mins = ''.$mins;
			if (strlen($mins) == 1) $mins = '0'.$mins;
			return $hours.'h'.$mins;
		} else {
			if ($jours > 5) return $jours.' jours';
			
			if ($hours == 0) return $jours.' jour'.($jours > 1 ? 's':'');
			
			return $jours.'j '.$hours.'h';
		}
		
		return round($value).'&nbsp;mn';
	}
	
	public function transformForExcel($val) {
		$val = str_replace('&nbsp;', '', $val);
		$val = str_replace(' ', '', $val);
		$val = floatval($val);
	
		return $val;
	}
	
	public function getDefaultAlign() {
		return 'center';
	}
}