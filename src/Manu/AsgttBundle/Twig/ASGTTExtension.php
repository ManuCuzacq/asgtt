<?php

namespace Manu\AsgttBundle\Twig;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpFoundation\RequestStack;
use Manu\AsgttBundle\Managers\SecurityManager;



class ASGTTExtension extends \Twig_Extension {

	protected $container;
    /**
     *
     * @var type 
     */
    protected $requestStack;

    /**
     *
     * @var \Twig_Environment
     */
    protected $environment;

    /**
     * 
     * @param \Symfony\Component\HttpFoundation\Request $request
     */
    public function __construct(RequestStack $request_stack, $container) {
        $this->requestStack = $request_stack;
        $this->container = $container;
    }

    /**
     * 
     * @param \Twig_Environment $environment
     */
    public function initRuntime(\Twig_Environment $environment) {
        $this->environment = $environment;
    }

    /**
     * 
     * @return type
     */
    public function getFunctions() {
        return array(
        	'current_joueur' => new \Twig_Function_Method($this, 'currentJoueur', array('is_safe' => array('html'))),
        	'is_admin' => new \Twig_Function_Method($this, 'isAdmin', array('is_safe' => array('html'))),
        	'is_joueur' => new \Twig_Function_Method($this, 'isJoueur', array('is_safe' => array('html'))),
        	'getCurrentIndividu' => new \Twig_Function_Method($this, 'getCurrentIndividu', array('is_safe' => array('html'))),

       	
        	'client_widget' => new \Twig_Function_Method($this, 'clientWidget', array('is_safe' => array('html'))),
        	'select_regions_block' => new \Twig_Function_Method($this, 'selectRegionsBlock', array('is_safe' => array('html'))),
        		

        	'tuile_panier' => new \Twig_Function_Method($this, 'tuilePanier', array('is_safe' => array('html'))),
        		
        );
    }
    
    /**
     *
     * @return type
     */
    public function getFilters() {
    	return array(
    			'email_addr' => new \Twig_Filter_Method($this, 'emailAddr', array('is_safe' => array('html')))
    	);
    }
    
    public function getTests() {
    	return array(
    	);
    }
    
    public function emailAddr($email) {
    	$twig = $this->container->get('templating');
    	return $twig->render('SerielCultureSudBundle:Utils/divers:email.html.twig', array('email' => $email));
    }
    
    public function currentJoueur() {
    	$secuMgr = $this->container->get('security_manager');
    	$client = $secuMgr->getCurrentJoueur();
    	 
    	return $client;
    }
    
    public function getCurrentIndividu(){
    	$secuManager = $this->container->get('security_manager');
    	if (false) $secuManager = new SecurityManager();
    	 
    	return $secuManager->getCurrentIndividu();
    }

    /**
     * 
     * @return string
     */
    public function getName() {
        return 'cs_extension';
    }
    
    public function declinaisonAdminRender($declinaison) {
    	$twig = $this->container->get('templating');
    	return $twig->render('SerielCultureSudBundle:Utils:declinaison_admin.html.twig', array('declinaison' => $declinaison));
    }
    
    public function tuilePanier($ligne) {
    	if (!$ligne) {
    		$logger = $this->container->get('logger');
    		$logger->error('tuilePanier : ligne undefined');
    		return '';
    	}
    	
    	$twig = $this->container->get('templating');
    	return $twig->render('SerielCultureSudBundle:Utils/tuiles:ligne_panier.html.twig', array('ligne' => $ligne));
    }
    
    public function isAdmin() {
    	
    	$secuManager = $this->container->get('security_manager');
    	if (false) $secuManager = new SecurityManager();
    	
    	return $secuManager->isAdmin();
    }
    
    public function isJoueur(){
    	$secuManager = $this->container->get('security_manager');
    	if (false) $secuManager = new SecurityManager();
    	 
    	return $secuManager->isJoueur();
    }
}
