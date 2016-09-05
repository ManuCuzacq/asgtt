<?php

namespace Seriel\CultureSudBundle\Twig;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpFoundation\RequestStack;



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
        	'current_client' => new \Twig_Function_Method($this, 'currentClient', array('is_safe' => array('html'))),
        	'is_admin' => new \Twig_Function_Method($this, 'isAdmin', array('is_safe' => array('html'))),
        	'is_client' => new \Twig_Function_Method($this, 'isClient', array('is_safe' => array('html'))),
        		 
        	'tva_widget' => new \Twig_Function_Method($this, 'tvaWidget', array('is_safe' => array('html'))),
        	'select_compte_widget' => new \Twig_Function_Method($this, 'selectCompteWidget', array('is_safe' => array('html'))),
        		
        	'emails_dests_widget' => new \Twig_Function_Method($this, 'emailsDestsWidget', array('is_safe' => array('html'))),
        	'emails_files_widget' => new \Twig_Function_Method($this, 'emailsFilesWidget', array('is_safe' => array('html'))),
        		 
        	'region_widget' => new \Twig_Function_Method($this, 'regionWidget', array('is_safe' => array('html'))),
        	'pays_widget' => new \Twig_Function_Method($this, 'paysWidget', array('is_safe' => array('html'))),
        	'reg_widget' => new \Twig_Function_Method($this, 'regWidget', array('is_safe' => array('html'))),
        	'departement_widget' => new \Twig_Function_Method($this, 'departementWidget', array('is_safe' => array('html'))),
        	
        	'client_widget' => new \Twig_Function_Method($this, 'clientWidget', array('is_safe' => array('html'))),
        	'select_regions_block' => new \Twig_Function_Method($this, 'selectRegionsBlock', array('is_safe' => array('html'))),
        		
        	'tuile_article' => new \Twig_Function_Method($this, 'tuileArticle', array('is_safe' => array('html'))),
        	'panier_widget' => new \Twig_Function_Method($this, 'panierWidget', array('is_safe' => array('html'))),
        	'tuile_panier' => new \Twig_Function_Method($this, 'tuilePanier', array('is_safe' => array('html'))),
        		
        	'declinaison_admin_render' =>  new \Twig_Function_Method($this, 'declinaisonAdminRender', array('is_safe' => array('html')))
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
    
    public function currentClient() {
    	$secuMgr = $this->container->get('security_manager');
    	$client = $secuMgr->getCurrentClient();
    	 
    	return $client;
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
    
    public function tuileArticle($article, $articleQte = null) {
    	
    	if (!$article) {
    		$logger = $this->container->get('logger');
    		$logger->error('tuileArticle : article undefined');
    		return;
    	}
    	
    	$article_id = null;
    	
    	// di peut être soit un di, soit un identifiant di.
    	if (is_string($article) || is_int($article)) {
    		$article_id = ''.$article;
    		// On récupère donc le di.
    		$articlesManager = $this->container->get('articles_manager');
    		if (false) $articlesManager = new ArticlesManager();
    		 
    		$article = $articlesManager->getArticle($article_id);
    		
    		if (!$article) {
    			$logger = $this->container->get('logger');
    			$logger->error('tuileArticle : article non trouvé : '.$article_id);
    			return;
    		}
    	}
    	$datas = array('article' => $article , 'articleQte' => round($articleQte));
		
    	$twig = $this->container->get('templating');
    	return $twig->render('SerielCultureSudBundle:Utils/tuiles:articles.html.twig', $datas);
    }
    
    public function tuileEmail($email) {
    	if (!$email) {
    		$logger = $this->container->get('logger');
    		$logger->error('tuileEmail : email undefined');
    		return;
    	}
    	
    	$email_id = null;
    	
    	// di peut être soit un dd, soit un identifiant dd.
    	if (is_string($email) || is_int($email)) {
    		$email_id = ''.$email;
    		// On récupère donc le dd.
    		$emailsManager = $this->container->get('emails_manager');
    		if (false) $emailsManager = new EmailsManager();
    		 
    		$email = $emailsManager->getEmail($email_id);
    	
    		if (!$email) {
    			$logger = $this->container->get('logger');
    			$logger->error('tuileEmail : email non trouvé : '.$email_id);
    			return;
    		}
    	} else {
    		if (false) $email = new Email();
    		$email_id = $email->getId();
    	}
    	
    	$datas = array('email' => $email);
    	
    	$twig = $this->container->get('templating');
    	return $twig->render('SerielCultureSudBundle:Utils/tuiles:email.html.twig', $datas);
    }
    
    public function emailsFilesWidget($object = null, $name = null, $value = null, $options = null) {
    	$twig = $this->container->get('templating');
    	 
    	$datas = array();
    	 
    	if ($name) $datas['name'] = $name;
    	if ($value) $datas['value'] = $value;
    	 
    	$multi = false;
    	$thin = false;
    	$full_open = false;
    	$short = false;
    	 
    	if ($options && is_array($options)) {
    		if (isset($options['resume_name']) && $options['resume_name']) $datas['resume_name'] = $options['resume_name'];
    		if (isset($options['resume_pos']) && $options['resume_pos']) $datas['resume_pos'] = $options['resume_pos'];
    		if (isset($options['multi']) && $options['multi']) $multi = true;
    		if (isset($options['thin']) && $options['thin']) $thin = true;
    		if (isset($options['full_open']) && $options['full_open']) $full_open = true;
    		if (isset($options['short']) && $options['short']) $short = true;
    		 
    		if (isset($options['title']) && $options['title']) $datas['title'] = $options['title'];
    		if (isset($options['fixed_title']) && $options['fixed_title']) $datas['fixed_title'] = $options['fixed_title'];
    		
    		if (isset($options['disabled']) && $options['disabled']) $datas['disabled'] = $options['disabled'];
    		 
    		if (isset($options['has_resume']) && $options['has_resume']) $datas['has_resume'] = $options['has_resume'];
    	}
    	 
    	$datas['multi'] = $multi;
    	$datas['thin'] = $thin;
    	$datas['full_open'] = $full_open;
    	$datas['short'] = $short;
    	 
    	$filesByObj = DataUtils::getAllFilesByObj($object);
    	 
    	$datas['filesByObj']  = $filesByObj;
    	 
    	return $twig->render('SerielCultureSudBundle:Utils/widgets:email_files_widget.html.twig', $datas);
    }
    
    public function emailsDestsWidget($object = null, $name = null, $value = null, $options = null) {
    	$twig = $this->container->get('templating');
    	 
    	$datas = array();
    	 
    	if ($name) $datas['name'] = $name;
    	if ($value) $datas['value'] = $value;
    	 
    	$multi = false;
    	$thin = false;
    	$full_open = false;
    	$short = false;
    	 
    	if ($options && is_array($options)) {
    		if (isset($options['resume_name']) && $options['resume_name']) $datas['resume_name'] = $options['resume_name'];
    		if (isset($options['resume_pos']) && $options['resume_pos']) $datas['resume_pos'] = $options['resume_pos'];
    		if (isset($options['multi']) && $options['multi']) $multi = true;
    		if (isset($options['thin']) && $options['thin']) $thin = true;
    		if (isset($options['full_open']) && $options['full_open']) $full_open = true;
    		if (isset($options['short']) && $options['short']) $short = true;
    		 
    		if (isset($options['title']) && $options['title']) $datas['title'] = $options['title'];
    		if (isset($options['fixed_title']) && $options['fixed_title']) $datas['fixed_title'] = $options['fixed_title'];
    		
    		if (isset($options['disabled']) && $options['disabled']) $datas['disabled'] = $options['disabled'];
    		 
    		if (isset($options['has_resume']) && $options['has_resume']) $datas['has_resume'] = $options['has_resume'];
    	}
    	 
    	$datas['multi'] = $multi;
    	$datas['thin'] = $thin;
    	$datas['full_open'] = $full_open;
    	$datas['short'] = $short;
    	 
    	$individusByTypeDest = DataUtils::getAllIndividuByTypeDest($object);
    	 
    	$clientContacts = $individusByTypeDest[EmailModelDest::EMAIL_MODEL_DEST_SITE_CLIENT];
    	$structureContacts = $individusByTypeDest[EmailModelDest::EMAIL_MODEL_DEST_STRUCTURE_CLIENT];
    	$prestataireContacts = $individusByTypeDest[EmailModelDest::EMAIL_MODEL_DEST_PRESTATAIRE];
    	$intervenants = $individusByTypeDest[EmailModelDest::EMAIL_MODEL_DEST_INTERVENANT_AE];
    	$respsAe = $individusByTypeDest[EmailModelDest::EMAIL_MODEL_DEST_RESPONSABLE_AE];
    	 
    	$datas['client'] = $individusByTypeDest['client'];
    	$datas['structure'] = $individusByTypeDest['structure'];
    	$datas['prestataire'] = $individusByTypeDest['prestataire'];
    	 
    	$datas['clientContacts'] = $clientContacts;
    	$datas['structureContacts'] = $structureContacts;
    	$datas['prestataireContacts'] = $prestataireContacts;
    	$datas['intervenants'] = $intervenants;
    	$datas['respsAe'] = $respsAe;
    	 
    	return $twig->render('SerielCultureSudBundle:Utils/widgets:email_dests_widget.html.twig', $datas);
    }
    
    public function tvaWidget($name = null, $value = null, $options = null) {
    	$twig = $this->container->get('templating');
    	
    	$tvaManager = $this->container->get('tauxTVA_manager');
    	if (false) $tvaManager = new TauxTVAManager();
    	
    	$list_taux = $tvaManager->getAllTauxTVA();
    	 
    	$datas = array('list_taux' => $list_taux);
    	if ($name) $datas['name'] = $name;
    	if ($value) $datas['value'] = $value;
    	 
    	$multi = false;
    	$thin = false;
    	$full_open = false;
    	 
    	if ($options && is_array($options)) {
    		if (isset($options['resume_name']) && $options['resume_name']) $datas['resume_name'] = $options['resume_name'];
    		if (isset($options['resume_pos']) && $options['resume_pos']) $datas['resume_pos'] = $options['resume_pos'];
    		if (isset($options['multi']) && $options['multi']) $multi = true;
    		if (isset($options['thin']) && $options['thin']) $thin = true;
    		if (isset($options['full_open']) && $options['full_open']) $full_open = true;
    
    		if (isset($options['title']) && $options['title']) $datas['title'] = $options['title'];
    		if (isset($options['fixed_title']) && $options['fixed_title']) $datas['fixed_title'] = $options['fixed_title'];
    		
    		if (isset($options['disabled']) && $options['disabled']) $datas['disabled'] = $options['disabled'];
    
    		if (isset($options['has_resume']) && $options['has_resume']) $datas['has_resume'] = $options['has_resume'];
    	}
    	 
    	$datas['multi'] = $multi;
    	$datas['thin'] = $thin;
    	$datas['full_open'] = $full_open;
    	
    	if (!$value) {
    		// on test si on a un taux par défaut.
    		foreach ($list_taux as $taux) {
    			if ($taux->getDefaut()) {
    				$datas['value'] = $taux->getTaux();
    				break;
    			}
    		}
    	}
    	 
    	return $twig->render('SerielCultureSudBundle:Utils/widgets:tva_widget.html.twig', $datas);
    }
    
    public function paysWidget($name = null, $value = null, $options = null) {
    	if (!$name) $name = 'pays';
    	
    	if (!$options) $options = array();
    	$options['type'] = 'pays';
    	
    	return $this->regionWidget($name, $value, $options);
    }
    
    public function regWidget($name = null, $value = null, $options = null) {
    	if (!$name) $name = 'region';
    	 
    	if (!$options) $options = array();
    	$options['type'] = 'region';
    	 
    	return $this->regionWidget($name, $value, $options);
    }
    
    public function departementWidget($name = null, $value = null, $options = null) {
    	if (!$name) $name = 'departement';
    
    	if (!$options) $options = array();
    	$options['type'] = 'departement';
    
    	return $this->regionWidget($name, $value, $options);
    }
    
    public function regionWidget($name = null, $value = null, $options = null) {
    	$twig = $this->container->get('templating');
    
    	$regionsMgr = $this->container->get('regions_manager');
    	if (false) $regionsMgr = new RegionsManager();
    	
    	// Options type obligatoire.
    	if ((!$options) || (!isset($options['type']))) return "** type ? **";
    	
    	$str_type = strtolower($options['type']);
    	
    	$type = 0;
    	if ($str_type == 'pays') $type = Region::TYPE_REGION_PAYS;
    	else if ($str_type == 'region' || $str_type == 'reg') $type = Region::TYPE_REGION_REGION;
    	else if ($str_type == 'departement' || $str_type == 'dep') $type = Region::TYPE_REGION_DEPARTEMENT;
    	else return "$str_type ?";
    
    	$regions = $regionsMgr->getAllRegionsForType($type);
    
    	$datas = array('regions' => $regions);
    	if ($name) $datas['name'] = $name;
    	if ($value) $datas['value'] = $value;
    	 
    	$multi = false;
    	$thin = false;
    	$full_open = false;
    	 
    	if ($options && is_array($options)) {
    		if (isset($options['resume_name']) && $options['resume_name']) $datas['resume_name'] = $options['resume_name'];
    		if (isset($options['resume_pos']) && $options['resume_pos']) $datas['resume_pos'] = $options['resume_pos'];
    		if (isset($options['multi']) && $options['multi']) $multi = true;
    		if (isset($options['thin']) && $options['thin']) $thin = true;
    		if (isset($options['full_open']) && $options['full_open']) $full_open = true;
    
    		if (isset($options['title']) && $options['title']) $datas['title'] = $options['title'];
    		if (isset($options['fixed_title']) && $options['fixed_title']) $datas['fixed_title'] = $options['fixed_title'];
    		
    		if (isset($options['disabled']) && $options['disabled']) $datas['disabled'] = $options['disabled'];
    
    		if (isset($options['has_resume']) && $options['has_resume']) $datas['has_resume'] = $options['has_resume'];
    	}
    	 
    	$datas['multi'] = $multi;
    	$datas['thin'] = $thin;
    	$datas['full_open'] = $full_open;
    
    	return $twig->render('SerielCultureSudBundle:Utils/widgets:region_widget.html.twig', $datas);
    }
    
    public function clientWidget($name = null, $value = null, $options = null) {
    	$twig = $this->container->get('templating');
    	 
    	$comptesMgr = $this->container->get('comptes_manager');
    	if (false) $comptesMgr = new ComptesManager();
    	 
    	// Options type obligatoire.
    	if ((!$options) || (!isset($options['compte']))) return "** compte ? **";
    	 
    	$compte_id = strtolower($options['compte']);
    	 
    	$compte = $comptesMgr->get($compte_id);
    	if (false) $compte = new Compte();
    	
    	$comptes = array();
    	if ($compte) {
    		$comptes = $compte->getEntitesEnfants();
    	}
    	 
    	$datas = array('comptes' => $comptes);
    	if ($name) $datas['name'] = $name;
    	if ($value) $datas['value'] = $value;
    	 
    	$multi = false;
    	$thin = false;
    	$full_open = false;
    	 
    	if ($options && is_array($options)) {
    		if (isset($options['resume_name']) && $options['resume_name']) $datas['resume_name'] = $options['resume_name'];
    		if (isset($options['resume_pos']) && $options['resume_pos']) $datas['resume_pos'] = $options['resume_pos'];
    		if (isset($options['multi']) && $options['multi']) $multi = true;
    		if (isset($options['thin']) && $options['thin']) $thin = true;
    		if (isset($options['full_open']) && $options['full_open']) $full_open = true;
    		 
    		if (isset($options['title']) && $options['title']) $datas['title'] = $options['title'];
    		if (isset($options['fixed_title']) && $options['fixed_title']) $datas['fixed_title'] = $options['fixed_title'];
    		
    		if (isset($options['disabled']) && $options['disabled']) $datas['disabled'] = $options['disabled'];
    		 
    		if (isset($options['has_resume']) && $options['has_resume']) $datas['has_resume'] = $options['has_resume'];
    	}
    	 
    	$datas['multi'] = $multi;
    	$datas['thin'] = $thin;
    	$datas['full_open'] = $full_open;
    	 
    	return $twig->render('SerielCultureSudBundle:Utils/widgets:compte_widget.html.twig', $datas);
    }
    
    public function selectRegionsBlock($pays = array(), $regions = array(), $departements = array()) {
    	$twig = $this->container->get('templating');
    	 
    	return $twig->render('SerielCultureSudBundle:Utils/widgets:select_regions_block.html.twig', array('pays' => $pays, 'regions' => $regions, 'departements' => $departements));
    }
    
    public function isInstanceof($var, $instance) {
    	$logger = $this->container->get('logger');
    	$res = $var instanceof $instance;
    	$logger->info('TEST : '.get_class($var).' instanceof : '.$instance.' >> '.$res);
    	return $res;
    }
    
    public function panierWidget($panier=null){

    	if (!$panier) {
    		$logger = $this->container->get('logger');
    		$logger->error('panier_widget : panier undefined');
    		return;
    	}
    	 
    	$panier_id = null;
    	 
    	// di peut être soit un di, soit un identifiant di.
    	if (is_string($panier) || is_int($panier)) {
    		$panier_id = ''.$panier;
    		// On récupère donc le di.
    		$paniersManager = $this->container->get('paniers_manager');
    		if (false) $paniersManager = new PaniersManager();
    		 
    		$panier = $paniersManager->getPanier($panier_id);
    	
    		if (!$panier) {
    			$logger = $this->container->get('logger');
    			$logger->error('panierWidget: panier non trouvé : '.$panier_id);
    			return;
    		}
    	}
    	 
    	$lignes = $panier->getLignes();

    	$datas = array('panier' => $panier, 'lignes' => $lignes);
    	
    	$twig = $this->container->get('templating');
    	return $twig->render('SerielCultureSudBundle:Utils/widgets:panierWidget.html.twig', $datas);
    }
    
    public function isAdmin() {
    	
    	$secuManager = $this->container->get('security_manager');
    	if (false) $secuManager = new SecurityManager();
    	
    	return $secuManager->isAdmin();

    }
    
    public function isClient(){
    	$secuManager = $this->container->get('security_manager');
    	if (false) $secuManager = new SecurityManager();
    	 
    	return $secuManager->isClient();
    }
}
