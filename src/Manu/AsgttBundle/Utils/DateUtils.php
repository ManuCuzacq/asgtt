<?php

namespace Manu\AsgttBundle\Utils;

class DateUtils {
	
	public static $SHORTDAYS = array ('mon' => 'lun', 'tue' => 'mar', 'wed' => 'mer', 'thu'=> 'jeu', 'fri' => 'ven', 'sat' => 'sam', 'sun' => 'dim');
	
	public static function firstDayOfWeek($week) {
		if (!$week) return null;
		
		$splitted = explode('+', $week);
		if (count($splitted) != 2) $splitted = explode('-', $week);
		if (count($splitted) != 2) return null;
		
		$year = intval($splitted[0]);
		$weekNum = intval($splitted[1]);
		
		$offset = date('w', mktime(0,0,0,1,1,$year));
		$offset = ($offset < 5) ? 1-$offset : 8-$offset;
		$monday = mktime(0,0,0,1,1+$offset,$year);
		$time = strtotime('+'.($weekNum - 1).' weeks', $monday);
		return date('Y-m-d', $time);
	}
	
	public static function sqlserverDateTimeToDateStr($sqlserverDateTime) {
		if (!$sqlserverDateTime) return null;
		
		$parsedDateTime = date_parse_from_format('M d Y G:i:s:uA', $sqlserverDateTime);
		if ($parsedDateTime['warning_count'] > 0) {
			foreach ($parsedDateTime['warnings'] as $key => $warn) {
				// TODO log.
			}
		}
		
		if ($parsedDateTime['error_count'] > 0) {
			foreach ($parsedDateTime['errors'] as $key => $err) {
				// TODO log.
			}
				
			return null;
		}
		
		$year = intval($parsedDateTime['year']);
		$month = ''.intval($parsedDateTime['month']);
		$day = ''.intval($parsedDateTime['day']);
		$hour = ''.intval($parsedDateTime['hour']);
		$minute = ''.intval($parsedDateTime['minute']);
		$second = ''.intval($parsedDateTime['second']);
		
		if (strlen($month) == 1) $month = '0'.$month;
		if (strlen($day) == 1) $day = '0'.$day;
		if (strlen($hour) == 1) $hour = '0'.$hour;
		if (strlen($minute) == 1) $minute = '0'.$minute;
		if (strlen($second) == 1) $second = '0'.$second;
		
		$dateTimeStr = "$year-$month-$day $hour:$minute:$second";
		
		return $dateTimeStr;
	}
	
	public static function sqlserverDateTimeToPhpDateTime($sqlserverDateTime) {
		$dateTimeStr = self::sqlserverDateTimeToDateStr($sqlserverDateTime);
		
		if ($dateTimeStr) {
			return \DateTime::createFromFormat("Y-m-d H:i:s", $dateTimeStr);
		}
		
		return null;
	}
	
	public static function explodeDate($date) {
		if (!$date) return array('day' => null, 'month' => null, 'year' => null);
		$splitted = explode('-', $date);
		
		if (count($splitted) != 3) return array('day' => null, 'month' => null, 'year' => null);
		
		return array('day' => $splitted[2], 'month' => $splitted[1], 'year' => $splitted[0]);
	}
	
	public static function getDateInfosFromString($val) {
		if (!$val) return null;
		
		// Let's split.
		$splitted = explode('::', $val);
		if (count($splitted) == 2) {
			// Il s'agit d'une periode.
			$from = $splitted[0];
            $to = $splitted[1];
            
            if ((!$from) && (!$to)) return null;
            
            return array('from' => self::explodeDate($from), 'to' => self::explodeDate($to));
		}
		
		// Let's split again.
		$splitted = explode('+', $val);
		if (count($splitted) == 2) {
			$firstDay = self::firstDayOfWeek($val);
			if (!$firstDay) return null;
			
			$splitted2 = explode('-', $firstDay);
			$year = intval($splitted2[0]);
			$month = intval($splitted2[1]);
			$day = intval($splitted2[2]);
			
			$lastDay = date('Y-m-d', mktime(12, 0, 0, $month, $day+6, $year));
			
			return array('from' => self::explodeDate($firstDay), 'to' => self::explodeDate($lastDay));
			
			return null;
		}
		
		// Let's split again.
		$splitted = explode('-', $val);
		if (count($splitted) == 3) {
			// C'est un jour.
			return self::explodeDate($val);
		}
		if (count($splitted) == 2) {
			// C'est un mois.
			$year = intval($splitted[0]);
			$month = intval($splitted[1]);
			
			$from = $val."-01";
			$to = date('Y-m-d', mktime(12, 0, 0, $month+1, 0, $year));
			
			return array('from' => self::explodeDate($from), 'to' => self::explodeDate($to));
		}
		
		// Si on arrive ici, il doit s'agit d'une année.
		return array('from' => self::explodeDate($val.'-01-01'), 'to' => self::explodeDate($val.'-12-31'));
	}
	
	public static function dateShort($date) {
		if (!$date) return '';
		
		if ($date instanceof \DateTime) {
			$date = $date->format('Y-m-d');
		}
		
		$splitted = explode('-', $date);
		if (count($splitted) != 3) $splitted = explode('/', $date);
		
		if (count($splitted) != 3) return '';
		
		$day = '';
		$month = '';
		$year = '';
		
		if (strlen($splitted[2]) == 4) {
			$day = $splitted[0];
			$month = $splitted[1];
			$year = $splitted[2];
		} else {
			$day = $splitted[2];
			$month = $splitted[1];
			$year = $splitted[0];
		}
		
		return $day.'/'.$month;
	}
	
	public static function dateShortestPossible($date) {
		if (!$date) return '';
		
		if ($date instanceof \DateTime) {
			$date = $date->format('Y-m-d H:i:s');
		}
		
		$today = date('Y-m-d');
		$splitted = explode('-', $today);
		
		$yearToday = intval($splitted[0]);
		$monthToday = intval($splitted[1]);
		$dayToday = intval($splitted[2]);
		
		$splitted = explode(' ', $date);
		
		$dateJour = $date;
		$dateHeure = null;
		
		if (count($splitted) == 2) {
			$dateJour = $splitted[0];
			$dateHeure = $splitted[1];
		}
		
		$splitted = explode('-', $dateJour);
		$yearDate = intval($splitted[0]);
		$monthDate = intval($splitted[1]);
		$dayDate = intval($splitted[2]);
		
		$heureDate = 0;
		$minutesDate = 0;
		$secondesDate = 0;
		
		if ($dateHeure) {
			$splitted = explode(':', $dateHeure);
			if (count($splitted) > 1) {
				$heureDate = intval($splitted[0]);
				$minutesDate = intval($splitted[1]);
				if (count($splitted) > 2) $secodnesDate = intval($splitted[2]);
			}
		}
		
		// On calcul le nombre de jours d'écart.
		$timeToday = strtotime("$yearToday-$monthToday-$dayToday");
		$timeDate = strtotime("$yearDate-$monthDate-$dayDate");
		
		$diffSeconds = abs($timeToday - $timeDate);
		$diffMinutes = $diffSeconds / 60;
		$diffHours = $diffMinutes / 60;
		$diffDays = $diffHours / 24;
		
		
		if ($yearDate == $yearToday && $monthDate == $monthToday && $dayDate == $dayToday) {
			// Il s'agit du même jour.
			// Soit on a une heure et on l'affiche, soit on affiche "ajourd'hui".
			if ($dateHeure) {
				$strHeure = ''.$heureDate;
				$strMinutes = ''.$minutesDate;
				
				while (strlen($strMinutes) < 2) $strMinutes = '0'.$strMinutes;
				
				$res = $strHeure.':'.$strMinutes;
				
				return $res;
			} else {
				return "aujourd'hui";
			}
		} else if ($diffDays < 7) {
			$time = strtotime($date);
			$j = strtolower(date('D', $time));
			
			$j = self::$SHORTDAYS[$j];
			
			if ($dateHeure) {
				$strHeure = ''.$heureDate;
				$strMinutes = ''.$minutesDate;
				
				while (strlen($strMinutes) < 2) $strMinutes = '0'.$strMinutes;
				
				$res = "$j. ".$strHeure.':'.$strMinutes;
				return $res;
			}
			return $j.'.';
		} else if ($diffDays < 14) {
			$time = strtotime($date);
			$j = strtolower(date('D', $time));
				
			$j = self::$SHORTDAYS[$j];
			
			$dt = date('d/m', $time);
			
			return $j.'. '.$dt;
		}
		
		$time = strtotime($date);
		return date('d/m/Y', $time);
		
	}
	
	public static function getDayOfWeek($int_day) {
		if ($int_day == 1) return 'lundi';
		if ($int_day == 2) return 'mardi';
		if ($int_day == 3) return 'mercredi';
		if ($int_day == 4) return 'jeudi';
		if ($int_day == 5) return 'vendredi';
		if ($int_day == 6) return 'samedi';
		if ($int_day == 7) return 'dimanche';
	}
	
	public static function getIntDayOfWeekFromString($day) {
		if (strtolower($day) == 'lundi') return 1;
		if (strtolower($day) == 'mardi') return 2;
		if (strtolower($day) == 'mercredi') return 3;
		if (strtolower($day) == 'jeudi') return 4;
		if (strtolower($day) == 'vendredi') return 5;
		if (strtolower($day) == 'samedi') return 6;
		if (strtolower($day) == 'dimanche') return 7;
	}
	
	public static function getMonth($int_month) {
		if ($int_month == 1) return 'janvier';
		if ($int_month == 2) return 'février';
		if ($int_month == 3) return 'mars';
		if ($int_month == 4) return 'avril';
		if ($int_month == 5) return 'mai';
		if ($int_month == 6) return 'juin';
		if ($int_month == 7) return 'juillet';
		if ($int_month == 8) return 'août';
		if ($int_month == 9) return 'septembre';
		if ($int_month == 10) return 'octobre';
		if ($int_month == 11) return 'novembre';
		if ($int_month == 12) return 'décembre';
	}
	
	public static function getIntMonthFromString($month) {
		if (strtolower($month) == 'janvier') return 1;
		if (strtolower($month) == 'février' || strtolower($month) == 'fevrier') return 2;
		if (strtolower($month) == 'mars') return 3;
		if (strtolower($month) == 'avril') return 4;
		if (strtolower($month) == 'mai') return 5;
		if (strtolower($month) == 'juin') return 6;
		if (strtolower($month) == 'juillet') return 7;
		if (strtolower($month) == 'août') return 8;
		if (strtolower($month) == 'septembre') return 9;
		if (strtolower($month) == 'octobre') return 10;
		if (strtolower($month) == 'novembre') return 11;
		if (strtolower($month) == 'décembre' || strtolower($month) == 'decembre') return 12;
	}
}