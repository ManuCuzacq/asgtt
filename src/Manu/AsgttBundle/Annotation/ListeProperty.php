<?php

namespace Manu\AsgttBundle\Annotation;

use Doctrine\ORM\Mapping\Annotation;

/**
 * @Annotation
 */
final class ListeProperty implements Annotation
{
	private $propertyName;
	
	private $method = null;
	private $return_type = null;
	private $type = "var";
	private $label = null;
	private $logo = null;
	private $class_supp = null;
	private $sort = null;
	private $format = null;
	private $dbfield = null;
	private $dbfieldformat = null;
	private $dbfieldsort = null;
	private $filter = null; 
	private $align = null;
	private $credential = null;
	private $width = null;
	
	private $objectClass = null;
	private $objectPrefix = null;
	private $objectPostfix = null;
	
	private $editable = null;
	private $editableUpdateFunc = null;
	
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
	
	public function getLogo()
	{
		return $this->logo;
	}
	
	public function getClassSupp() {
		return $this->class_supp;
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
	
	public function getDbfield()
	{
		return $this->dbfield;
	}
	
	public function getDbfieldformat()
	{
		return $this->dbfieldformat;
	}
	
	public function getDbfieldsort()
	{
		return $this->dbfieldsort;
	}
	
	public function getFilter()
	{
		return $this->filter;
	}
	
	public function getAlign()
	{
		return $this->align;
	}
	
	public function getCredential() {
		return $this->credential;
	}
	
	public function getWidth() {
		return $this->width;
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
	
	public function getEditable() {
		return $this->editable;
	}
	
	public function getEditableUpdateFunc() {
		return $this->editableUpdateFunc;
	}
}