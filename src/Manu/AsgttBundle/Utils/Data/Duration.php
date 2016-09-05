<?php

namespace Manu\AsgttBundle\Utils\Data;

class Duration {
	protected $w = 0;
	protected $d = 0;
	protected $h = 0;
	protected $m = 0;
	
	// TODO : put this elsewhere
	const HOURS_BY_DAY = 10;
	const DAYS_BY_WEEK = 5;
	
	public function __construct($duration, $days = null, $hours = null, $minutes = null) {
		if ($duration === null) return;
		
		if ($days === null && $hours === null && $minutes === null) {
			$splitted = explode('+', $duration);
			if (count($splitted)== 4) {
				$this->w = intval($splitted[0]);
				$this->d = intval($splitted[1]);
				$this->h = intval($splitted[2]);
				$this->m = intval($splitted[3]);
			}
			
			return;
		}
		
		$weeks = $duration;
	
		$this->w = $weeks;
		$this->d = $days;
		$this->h = $hours;
		$this->m = $minutes;
		
		//error_log('TEST DURATION OBJECT : '.$this->w.' '.$this->d.' '.$this->h.' '.$this->m);
	}
	
	public function setWeeks($weeks) {
		$this->w = $weeks;
	}
	public function getWeeks() {
		return $this->w;
	}
	
	public function setDays($days) {
		$this->d = $days;
	}
	public function getDays() {
		return $this->d;
	}
	
	public function setHours($hours) {
		$this->h = $hours;
	}
	public function getHours() {
		return $this->h;
	}
	public function setMinutes($minutes) {
		$this->m = $minutes;
	}
	public function getMinutes() {
		return $this->m;
	}
	
	public function __toString() {
		$str_weeks = ''.intval($this->w);
		$str_days = ''.intval($this->d);
		$str_hours = ''.intval($this->h);
		$str_minutes = ''.intval($this->m);
		
		while (strlen($str_minutes) < 2) {
			$str_minutes = '0'.$str_minutes;
		}
		
		while (strlen($str_hours) < 2) {
			$str_hours = '0'.$str_hours;
		}
		
		while (strlen($str_days) < 2) {
			$str_days = '0'.$str_days;
		}
		
		while (strlen($str_weeks) < 3) {
			$str_weeks = '0'.$str_weeks;
		}
		
		return $str_weeks.'+'.$str_days.'+'.$str_hours.'+'.$str_minutes;
	}
	
	public function niceDuration() {
		$weeks_str = '';
		$days_str = '';
		$hours_str = '';
		$minutes_str = '';
		
		$weeks_str = $this->w.' semaine'.($this->w > 1 ? 's':'');
		$days_str = $this->d.' jour'.($this->d > 1 ? 's':'');
		$hours_str = $this->h.' heure'.($this->h > 1 ? 's':'');
		$minutes_str = $this->m.' minute'.($this->m > 1 ? 's':'');
		
		if ($this->w) {
			return $weeks_str.' '.$days_str;
		}
		if ($this->d) {
			return $days_str.' '.$hours_str;
		}
		if ($this->h) {
			return $hours_str.' '.$minutes_str;			
		}
		return $minutes_str;
	}
	
	public function niceShortDuration() {
		if ($this->w == 0 && $this->d == 0 && $this->h == 0) {
			return round($this->m).'&nbsp;mn';
		} else if ($this->w == 0 && $this->d == 0) {
			$mins = ''.round($this->m);
			if (strlen($mins) == 1) $mins = '0'.$mins;
			return round($this->h).'h'.$mins;
		} else if ($this->w == 0) {
			if ($this->h == 0) return $this->d.' jour'.($this->d > 1 ? 's':'');
			return $this->d.'j '.$this->h.'h';
		} else {
			if ($this->d == 0) return $this->w.' semaines'.($this->w > 1 ? 's':'');
			return $this->w.'sem '.$this->d.'j';
		}
		
		return '';
	}
	
	public function getDurationInMinutes() {
		$weeks_in_minutes = $this->w * self::DAYS_BY_WEEK * self::HOURS_BY_DAY * 60;
		$days_in_minutes = $this->d * self::HOURS_BY_DAY * 60;
		$hours_in_minutes = $this->h * 60;
		$minutes = $this->m;
		
		return $weeks_in_minutes + $days_in_minutes + $hours_in_minutes + $minutes;
		
	}
	public function getDurationInHours() {
		$weeks_in_hours = $this->w * self::DAYS_BY_WEEK * self::HOURS_BY_DAY;
		$days_in_hours = $this->d * self::HOURS_BY_DAY;
		$hours = $this->h;
		$minutes_in_hours = $this->m / 60;
		
		return $weeks_in_hours + $days_in_hours + $hours + $minutes_in_hours;
	}
	public function getDurationInDays() {
		$weeks_in_days = $this->w * self::DAYS_BY_WEEK;
		$days = $this->d;
		$hours_in_days = $this->h / self::HOURS_BY_DAY;
		$minutes_in_days = $this->m / 60 / self::HOURS_BY_DAY;
		
		return $weeks_in_days + $days + $hours_in_days + $minutes_in_days;
	}
	public function getDurationInWeeks() {
		$weeks = $this->w;
		$days_in_weeks = $this->d / self::DAYS_BY_WEEK;
		$hours_in_weeks = $this->h / self::HOURS_BY_DAY / self::DAYS_BY_WEEK;
		$minutes_in_weeks = $this->m / 60 / self::HOURS_BY_DAY / self::DAYS_BY_WEEK;
		
		return $weeks + $days_in_weeks + $hours_in_weeks + $minutes_in_weeks;
	}
	
	public function __toFloat() {
		// On renvoie le nombre de minutes.
		return $this->getDurationInMinutes();
	}
}