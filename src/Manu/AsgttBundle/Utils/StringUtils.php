<?php

namespace Seriel\AppliToolboxBundle\Utils;

class StringUtils {
	
	public static function bodyMailPreview($body, $length = 200) {
		if (!$body) return '';
		
		$body = str_replace('</p>', '</p> ', $body);
		$body = str_replace('<br/>', ' ', $body);
		$body = str_replace('<br>', ' ', $body);
		$body = str_replace('<br />', ' ', $body);
		
		$str = trim(strip_tags($body));
		$str = html_entity_decode($str);
		return substr($str, 0, $length);
	}
	
	public static function htmlToTxt($html) {
		if (!$html) return '';
	
		$txt = str_replace('</p>', '</p><br/>', $html);
		$txt = str_replace('<br/>', "\n", $txt);
		$txt = str_replace('<br>', "\n", $txt);
		$txt = str_replace('<br />', "\n", $txt);
	
		$txt = trim(strip_tags($txt));
		$txt = html_entity_decode($txt);
		
		return $txt;
	}
	
	public static function phoneUid($tel) {
		if (!$tel) return $tel;
		$res = "";
		for ($i = 0; $i < strlen($tel); $i++) {
			$c = $tel[$i];
			if ($c == '0' || $c == '1' || $c == '2' || $c == '3' || $c == '4' || $c == '5' || $c == '6' || $c == '7' || $c == '8' || $c == '9') {
				$res .= $c;
				continue;
			}
			if ($c == '+') {
				$res .= '00';
			}
		}
		return $res;		
	}
	
	public static function nicePhone($tel) {
		if ($tel == null || trim($tel)=='')
			return '&nbsp;';
		
		$res = '';
		for ($i = 0; $i < strlen($tel); $i++) {
			$c = $tel[$i];
			if ($c == '0' || $c == '1' || $c == '2' || $c == '3' || $c == '4' || $c == '5' || $c == '6' || $c == '7' || $c == '8' || $c == '9') {
				$res .= $c;
				continue;
			}
			if ($c == '+' && trim($res) == '') {
				$res .= '+';
			}
		}
		
		// On place maintenant les espaces.
		// On essaie de trouver s'il y a du +33 ou autre dans le genre.
		if (strlen($res) == 0) return $tel;
		if (strlen($res) < 3) return $res;
		
		$firstChar = $res[0];
		$begin = '';
		$rest = $res;
		if ($firstChar == '+') {
			$begin = substr($res, 0, 3).' '.substr($res, 3, 1).' ';
			$rest = substr($res, 4);
		} else if ($firstChar == '0') {
			$secondChar = $res[1];
			if ($secondChar == '0') {
				$begin = substr($res, 0, 2).' '.substr($res, 2, 2).' '.substr($res, 4, 1).' ';
				$rest = substr($res, 5);
			} else {
				// We do nothing, normal phone number.
			}
		} else {
			// Ca se complique. On test éventuellement un numéro français.
			$secondChar = $res[1];
			if ($firstChar == '3' && $secondChar == '3') {
				$begin = substr($res, 0, 2).' '.substr($res, 2, 1).' ';
				$rest = substr($res, 3);
			}
		}
					
		$real_res = $begin;
		for ($i = 0; $i < strlen($res); $i++) {
			$c = $rest[$i];
			if ($i != 0 && $i%2 == 0) $real_res .= ' ';
			$real_res .= $c;
		}
							
		return $real_res;
	}
	
	public static function removeAccents($str)
	{
		$str = preg_replace('#Ç#', 'C', $str);
		$str = preg_replace('#ç#', 'c', $str);
		$str = preg_replace('#è|é|ê|ë#', 'e', $str);
		$str = preg_replace('#È|É|Ê|Ë#', 'E', $str);
		$str = preg_replace('#à|á|â|ã|ä|å#', 'a', $str);
		$str = preg_replace('#@|À|Á|Â|Ã|Ä|Å#', 'A', $str);
		$str = preg_replace('#ì|í|î|ï#', 'i', $str);
		$str = preg_replace('#Ì|Í|Î|Ï#', 'I', $str);
		$str = preg_replace('#ð|ò|ó|ô|õ|ö#', 'o', $str);
		$str = preg_replace('#Ò|Ó|Ô|Õ|Ö#', 'O', $str);
		$str = preg_replace('#ù|ú|û|ü#', 'u', $str);
		$str = preg_replace('#Ù|Ú|Û|Ü#', 'U', $str);
		$str = preg_replace('#ý|ÿ#', 'y', $str);
		$str = preg_replace('#Ý#', 'Y', $str);
		 
		return $str;
	}
}