<?php

namespace Manu\AsgttBundle\Annotation;

use Doctrine\Common\Annotations\Reader;

class SerielCacheMethodPropertyConverter
{
	private $reader;
	private $annotationClass = 'Seriel\\AppliToolboxBundle\\Annotation\\CacheMethodProperty';

	public function __construct(Reader $reader)
	{
		$this->reader = $reader;
	}

	public function convert($class)
	{
		$convertedObject = new \stdClass;

		$reflectionClass = new \ReflectionClass($class);
		
		$res = array();
		
		foreach ($reflectionClass->getMethods() as $reflectionMethod) {
			// fetch the @SerielObject annotation from the annotation reader
			$annotation = $this->reader->getMethodAnnotation($reflectionMethod, $this->annotationClass);
			if (null !== $annotation) {
				$annotation->setMethodGet($reflectionMethod->name);
				$res[] = $annotation;
			}
		}

		return $res;
	}
}