<?php 

namespace Manu\AsgttBundle\Annotations;

class SerielAnnotationUtils {
	
	public static function getReturnType(\ReflectionMethod $method) {
		if (!$method) return null;
		
		$comment = $method->getDocComment();
		if (!$comment) return null;
		
		$filtre = "@return +[^ ]+";
		$matches = array();
		
		//error_log('PREG_MATCH : '.$filtre.' >> '.$this->subject);
		preg_match('/'.$filtre.'/', $comment, $matches);
		
		if ($matches && count($matches) == 1) {
			$res = trim(substr($matches[0], 8));
			
			error_log('test return val : '.$method->name.' >> '.$matches[0].' >> '.$res);
			
			return $res;
		} else {
			error_log('test return val : '.$method->name.' >> !!!!! NOT FOUND !!!!!');
		}
		
		return null;
	}
}