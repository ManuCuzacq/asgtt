<?php

namespace Manu\AsgttBundle\Annotation;

use Doctrine\ORM\Mapping\Annotation;

/**
 * @Annotation
 */
final class CacheMethodProperty implements Annotation
{
	private $propertyName;
	
	private $methodGet = null;
	private $methodSet = null;
	
	public function __construct($options)
	{
		if (isset($options['value'])) {
			$options['propertyName'] = $options['value'];
			unset($options['value']);
		}
		
		if (isset($options['setter'])) {
			$this->methodSet = $options['setter'];
			unset($options['setter']);
		}
	
		foreach ($options as $key => $value) {
			if (!property_exists($this, $key)) {
				throw new \InvalidArgumentException(sprintf('Property "%s" does not exist', $key));
			}
	
			$this->$key = $value;
		}
	}
	
	public function setMethodGet($method) {
		$this->methodGet = $method;
	}
	
	public function getPropertyName()
	{
		return $this->propertyName;
	}
	
	public function getMethodGet()
	{
		return $this->methodGet;
	}
	
	public function getMethodSet()
	{
		return $this->methodSet;
	}
}