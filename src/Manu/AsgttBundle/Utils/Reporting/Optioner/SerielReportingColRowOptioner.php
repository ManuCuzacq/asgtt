<?php 

namespace Manu\AsgttBundle\Utils\Reporting\Optioner;

abstract class SerielReportingColRowOptioner {
	
	public abstract function getCode();
	public abstract function render($templating = null);
	public abstract function transform($value, $object, $option);
	
	public function getJqueryWidgetName() {
		return null;
	}
}