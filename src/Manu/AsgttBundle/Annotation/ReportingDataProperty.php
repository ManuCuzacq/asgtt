<?php

namespace Manu\AsgttBundle\Annotation;

use Doctrine\ORM\Mapping\Annotation;

/**
 * @Annotation
 */
final class ReportingDataProperty implements Annotation
{
	private $propertyName;
	
	private $method = null;
	private $return_type = null;
	private $type = "var";
	private $label = null;
	private $label_short = null;
	private $sort = null;
	private $format = null;
	private $moyenne = null;
	private $align = null;
	private $credential = null;
	
	private $objectClass = null;
	private $objectPrefix = null;
	private $objectPostfix = null;
	
	public function __construct($options)
	{
		$this->type = "var";
		
		if (isset($options['value'])) {
			$options['propertyName'] = $options['value'];
			unset($options['value']);
		}
	
		foreach ($options as $key => $value) {
			if (!property_exists($this, $key)) {
				throw new \InvalidArgumentException(sprintf('Property "%s" does not exist', $key));
			}
	
			$this->$key = $value;
		}
	}
	
	public function getPropertyName()
	{
		return $this->propertyName;
	}
	
	public function getLabel()
	{
		return $this->label;
	}
	
	public function getLabelShort()
	{
		return $this->label_short;
	}
	
	public function getType()
	{
		return $this->type;
	}
	
	public function getObjectClass() {
		return $this->objectClass;
	}
	
	public function getObjectPrefix() {
		return $this->objectPrefix;
	}
	
	public function getObjectPostfix() {
		return $this->objectPostfix;
	}
	
	public function getSort()
	{
		return $this->sort;
	}
	
	public function getFormat()
	{
		return $this->format;
	}
	
	public function getMoyenne() {
		return $this->moyenne;
	}
	
	public function getAlign()
	{
		return $this->align;
	}
	
	public function getCredential() {
		return $this->credential;
	}
	
	public function setMethod($method) {
		$this->method = $method;
	}
	
	public function getMethod() {
		return $this->method;
	}
	
	public function twigMethod() {
		return ucfirst($this->method);
	}
}