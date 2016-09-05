<?php

namespace Manu\AsgttBundle\Managers;

use Manu\AsgttBundle\Utils\Liste\ListeElemRenderer;
use Manu\AsgttBundle\Annotation\ListeProperty;
use Manu\AsgttBundle\Utils\Liste\Formatter\BooleanFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\MontantFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\DateFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\DateTimeFormatter;
use Manu\AsgttBundle\Utils\Liste\Formatter\PercentFormatter;
use Manu\AsgttBundle\Utils\Liste\Sorter\NumberSorter;
use Manu\AsgttBundle\Utils\Liste\Sorter\DateSorter;
use Manu\AsgttBundle\Utils\Liste\Sorter\DateTimeSorter;
use Manu\AsgttBundle\Utils\Reporting\ReportingColRowRenderer;
use Manu\AsgttBundle\Annotation\SerielReportingColrRowPropertyConverter;
use Manu\AsgttBundle\Annotation\ReportingColRowProperty;
use Manu\AsgttBundle\Utils\Reporting\Optioner\DateTimeOptioner;
use Manu\AsgttBundle\Utils\Liste\Formatter\DurationFormatter;
use Manu\AsgttBundle\Utils\Reporting\Optioner\DurationOptioner;
use Manu\AsgttBundle\Utils\Reporting\ReportingDataRenderer;
use Manu\AsgttBundle\Annotation\ReportingDataProperty;
use Manu\AsgttBundle\Annotation\SerielReportingDatasPropertyConverter;
use Manu\AsgttBundle\Utils\Liste\Formatter\NumberFormatter;

class ReportingManager {
	protected $doctrine = null;
	protected $logger = null;
	protected $templating = null;
	protected $container = null;
	protected $user = null;
	
	protected $formatters = array();
	protected $sorters = array();
	protected $optioners = array();
	
	public function __construct($doctrine, $templating, $logger, $container) {
		$this->doctrine = $doctrine;
		$this->templating = $templating;
		$this->logger = $logger;
		$this->container = $container;
		$this->user = $this->container->get('security.context')->getToken()->getUser();
		
		$this->initFormatters();
		$this->initSorters();
		$this->initOptioners();
	}
	
	protected function initFormatters() {
		$this->addFormatter(new BooleanFormatter());
		$this->addFormatter(new MontantFormatter());
		$this->addFormatter(new DateFormatter());
		$this->addFormatter(new DateTimeFormatter());
		$this->addFormatter(new PercentFormatter());
		$this->addFormatter(new DurationFormatter());
		$this->addFormatter(new NumberFormatter());
	}
	
	protected function initSorters() {
		$this->addSorter(new NumberSorter());
		$this->addSorter(new DateSorter());
		$this->addSorter(new DateTimeSorter());
	}
	
	protected function initOptioners() {
		$this->addOptioner(new DurationOptioner());
		$this->addOptioner(new DateTimeOptioner());
	}
	
	protected function addFormatter($formatter) {
		if ($formatter) {
			$this->formatters[$formatter->getCode()] = $formatter;
		}
	}
	
	protected function addSorter($sorter) {
		if ($sorter) {
			$this->sorters[$sorter->getCode()] = $sorter;
		}
	}
	
	protected function addOptioner($optioner) {
		if ($optioner) {
			$this->optioners[$optioner->getCode()] = $optioner;
		}
	}
	
	public function getFormatter($code) {
		if (!$code) return null;
		if (isset($this->formatters[$code])) return $this->formatters[$code];
		
		return null;
	}
	
	public function getSorter($code) {
		if (!$code) return null;
		if (isset($this->sorters[$code])) return $this->sorters[$code];
	
		return null;
	}
	
	public function getOptioner($code) {
		if (!$code) return null;
		if (isset($this->optioners[$code])) return $this->optioners[$code];
		
		return null;
	}
	
	public static function orderRenderers(ReportingColRowRenderer $r1, ReportingColRowRenderer $r2) {
		$group1 = $r1->getGroup();
		$group2 = $r2->getGroup();
		
		$group_cmp = strcmp($group1, $group2);
		if ($group_cmp != 0) return $group_cmp;
		
		$label1 = $r1->getLabel();
		$label2 = $r2->getLabel();
		
		return strcmp($label1, $label2);
	}
	
	public function buildColRowsRenderer($className, &$recursionSecuClassesMap = null) {
		if (!$className) return null;
	
		if ($recursionSecuClassesMap === null) $recursionSecuClassesMap = array();
	
		if (isset($recursionSecuClassesMap[$className])) return null;
	
		$reader = $this->container->get('annotation_reader');
		$secuContext = $this->container->get('security.context');
			
		$converter = new SerielReportingColrRowPropertyConverter($reader);
		$colRows = $converter->convert($className);
	
		$renderers = array();
		if ($colRows) {
			foreach ($colRows as $colRow) {
				if (false) $colRow = new ReportingColRowProperty();
				
				// Securité.
				$cred = $colRow->getCredential();
				// Si l'utilisateur n'a aucun droit pour ce credential, on ne l'ajoute pas à la liste.
				if ($cred && (!$secuContext->isGranted('ANY_RIGHT_ON['.$className.' >> '.$cred.']'))) continue;
	
				$renderer = new ReportingColRowRenderer();
				$renderer->setPropertyName($colRow->getPropertyName());
				$renderer->setMethod($colRow->getMethod());
				$renderer->setLabel($colRow->getLabel());
				$renderer->setFormat($colRow->getFormat());
				$renderer->setSort($colRow->getSort());
				$renderer->setOption($colRow->getOption());
				$renderer->setAlign($colRow->getAlign());
				$renderer->setCredential($colRow->getCredential());
				
				$group = $className;
				$index = strrpos($group, "\\");
				if ($index !== false) $group = substr($group, $index+1);
				$renderer->setGroup($group);
	
				if (strtolower($colRow->getType()) == 'object') {
					// On n'affiche pas l'objet car on affiche tous ses éléments
				} else {
					$renderers[] = $renderer;
				}
	
	
				if (strtolower($colRow->getType()) == 'object') {
					// Il s'agit d'un objet, on essaie de detecter les elements de liste qui se trouvent à l'interieur.
					$subObjClass = $colRow->getObjectClass();
						
					if (!isset($recursionSecuClassesMap[$subObjClass])) {
						$foundElems = false;
						if ($subObjClass) {
							$subRenderers = $this->buildColRowsRenderer($subObjClass, $recursionSecuClassesMap);
							if ($subRenderers) {
								$preFix = $colRow->getObjectPrefix();
								$postFix = $colRow->getObjectPostfix();
	
								foreach ($subRenderers as $subRend) {
									$propName = $subRend->getPropertyName();
									$subRend->setPropertyName($renderer->getPropertyName().'.'.$propName);
									$group = $subRend->getGroup();
									$subRend->setGroup($renderer->getGroup().' / '.$group);
										
									$label = $subRend->getLabel();
									if ($preFix !== null) $subRend->setLabel($prefix.$label);
									else if ($postFix !== null) $subRend->setLabel($label.$postFix);
									else $subRend->setLabel($renderer->getLabel().'/'.$label);
	
									$method = $subRend->getMethod();
									$subRend->setMethod($renderer->getMethod().'()->'.$method);
	
									$renderers[] = $subRend;
	
									$foundElems = true;
								}
							}
						}
							
						if ($foundElems == false) {
							$renderers[] = $renderer;
						}
					}
				}
			}
		}
		
		// Let's order them.
		usort($renderers, array('Manu\AsgttBundle\Managers\ReportingManager', 'orderRenderers'));
	
		return $renderers;
	}
	
	public function buildDatasRenderer($className, &$recursionSecuClassesMap = null) {
		if (!$className) return null;
	
		if ($recursionSecuClassesMap === null) $recursionSecuClassesMap = array();
	
		if (isset($recursionSecuClassesMap[$className])) return null;
	
		$reader = $this->container->get('annotation_reader');
		$secuContext = $this->container->get('security.context');
			
		$converter = new SerielReportingDatasPropertyConverter($reader);
		$datas = $converter->convert($className);
	
		$renderers = array();
		if ($datas) {
			foreach ($datas as $data) {
				if (false) $data = new ReportingDataProperty();
				
				// Securité.
				$cred = $data->getCredential();
				// Si l'utilisateur n'a aucun droit pour ce credential, on ne l'ajoute pas à la liste.
				if ($cred && (!$secuContext->isGranted('ANY_RIGHT_ON['.$className.' >> '.$cred.']'))) continue;
	
				$renderer = new ReportingDataRenderer();
				$renderer->setPropertyName($data->getPropertyName());
				$renderer->setMethod($data->getMethod());
				$renderer->setLabel($data->getLabel());
				$renderer->setLabelShort($data->getLabelShort());
				$renderer->setFormat($data->getFormat());
				$renderer->setMoyenne($data->getMoyenne());
				$renderer->setSort($data->getSort());
				$renderer->setAlign($data->getAlign());
				$renderer->setCredential($data->getCredential());
	
				if (strtolower($data->getType()) == 'object') {
					// On n'affiche pas l'objet car on affiche tous ses éléments
				} else {
					$renderers[] = $renderer;
				}
	
	
				if (strtolower($data->getType()) == 'object') {
					// Il s'agit d'un objet, on essaie de detecter les elements de liste qui se trouvent à l'interieur.
					$subObjClass = $data->getObjectClass();
	
					if (!isset($recursionSecuClassesMap[$subObjClass])) {
						$foundElems = false;
						if ($subObjClass) {
							$subRenderers = $this->buildDatasRenderer($subObjClass, $recursionSecuClassesMap);
							if ($subRenderers) {
								$preFix = $data->getObjectPrefix();
								$postFix = $data->getObjectPostfix();
	
								foreach ($subRenderers as $subRend) {
									$propName = $subRend->getPropertyName();
									$subRend->setPropertyName($renderer->getPropertyName().'.'.$propName);
	
									$label = $subRend->getLabel();
									if ($preFix) $subRend->setLabel($prefix.$label);
									else if ($postFix) $subRend->setLabel($label.$postFix);
									else $subRend->setLabel($renderer->getLabel().'/'.$label);
	
									$method = $subRend->getMethod();
									$subRend->setMethod($renderer->getMethod().'()->'.$method);
	
									$renderers[] = $subRend;
	
									$foundElems = true;
								}
							}
						}
							
						if ($foundElems == false) {
							$renderers[] = $renderer;
						}
					}
				}
			}
		}
	
		return $renderers;
	}
	
	/*protected function buildColRowsRenderer($colRows) {
		$renderers = array();
		if ($colRows) {
			foreach ($colRows as $colRow) {
				if (false) $colRow = new ReportingColRowRenderer();
				
				$renderer = new ReportingColRowRenderer();
				$renderer->setPropertyName($colRow->getPropertyName());
				$renderer->setMethod($colRow->getMethod());
				$renderer->setLabel($colRow->getLabel());
				$renderer->setFormat($colRow->getFormat());
				$renderer->setSort($colRow->getSort());
				$renderer->setAlign($colRow->getAlign());
				
				$renderers[] = $renderer;
			}
		}
		
		return $renderers;
	}*/
	
	public function renderColRowsSelector($type, $options = null) {
		$managersMgr = $this->container->get('managers_manager');
		$manager = $managersMgr->getManagerForType($type);
		$className = $manager->getObjectClass();
		
		//$colRows = $manager->getReportingColRows();
		//$colRowsRenderers = $this->buildColRowsRenderer($colRows);
		
		$colRowsRenderers = $this->buildColRowsRenderer($className);
		
		$datas = array('renderers' => $colRowsRenderers, 'type' => $type, 'options' => $options);
		
		return $this->templating->render('SerielAppliToolboxBundle:Reporting:col_row.html.twig', $datas);
	}
	
	public function renderDatasSelector($type, $options = null) {
		$managersMgr = $this->container->get('managers_manager');
		$manager = $managersMgr->getManagerForType($type);
		$className = $manager->getObjectClass();
	
		//$colRows = $manager->getReportingColRows();
		//$colRowsRenderers = $this->buildColRowsRenderer($colRows);
	
		$datasRenderers = $this->buildDatasRenderer($className);
	
		$datas = array('renderers' => $datasRenderers, 'type' => $type, 'options' => $options);
	
		return $this->templating->render('SerielAppliToolboxBundle:Reporting:datas.html.twig', $datas);
	}
	
	public function renderDatasWidget($type, $options = null) {
		$managersMgr = $this->container->get('managers_manager');
		$manager = $managersMgr->getManagerForType($type);
		$className = $manager->getObjectClass();
	
		$datasRenderers = $this->buildDatasRenderer($className);
	
		$datas = array('renderers' => $datasRenderers, 'type' => $type, 'options' => $options);
	
		return $this->templating->render('SerielAppliToolboxBundle:Reporting:datas.html.twig', $datas);
	}
	
	public function activeSecurity() {
		return false;
		//return true;
	}
}