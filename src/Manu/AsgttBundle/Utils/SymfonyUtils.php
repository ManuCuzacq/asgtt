<?php

namespace Manu\AsgttBundle\Utils;

class SymfonyUtils {
	
	public static function get_clean_class($obj) {
		if (!$obj) return null;
		$className = get_class($obj);
		
		if (strpos($className, "Proxies\\__CG__\\") === 0) {
			$className = substr($className, 15);
		}
		
		return $className;
	}
	
	public static function get_current_server_http_root() {
		$scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
		
		$addr = $scheme.'://' . $_SERVER['HTTP_HOST'].'/';
		
		//$uri = $_SERVER['REQUEST_URI'];
		//if (strpos($uri, '/app_dev.php/') === 0) return $addr.'app_dev.php/';
		
		return $addr;
	}
	
}