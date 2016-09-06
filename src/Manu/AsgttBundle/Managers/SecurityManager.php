<?php

namespace Manu\AsgttBundle\Managers;

use Symfony\Component\DependencyInjection\ContainerInterface;
use P2\Bundle\RatchetBundle\WebSocket\Client\ClientProviderInterface;
use P2\Bundle\RatchetBundle\WebSocket\Client\ClientInterface;
use Symfony\Component\Security\Core\SecurityContext;
use Manu\AsgttBundle\Managers\SerielManager;

use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\SecurityContextInterface;

use Manu\AsgttBundle\Managers\JoueursManager;
use Manu\AsgttBundle\Managers\AdministratorsManager;
use Manu;

class SecurityManager implements ClientProviderInterface {
	
	const SESSION_CREDENTIAL_VAR = '__creds__';
	
	protected $container = null;
	protected $doctrine = null;
	protected $logger = null;
	protected $templating = null;
	
	public function __construct($container, $doctrine, $templating, $logger) {
		$this->container = $container;
		$this->doctrine = $doctrine;
		$this->templating = $templating;
		$this->logger = $logger;
	}
	
	public function getCurrentUser() {
		//error_log('DEBUG getCurrentUser()');
		if (false) $this->container = new ContainerInterface();
		
		/*$token = $this->container->get('security.context')->getToken();
		error_log('DEBUG TOKEN : '.get_class($token));*/
		
		// On initialise ici les données de l'utilisateur.
		$currentToken = $this->container->get('security.context')->getToken();
		$currentUser = $currentToken ? $currentToken->getUser() : null;
		
		if ($currentUser) {
			$session = $this->getSession();
			
			// On récupère les credentials.
			$creds = $session->get(self::SESSION_CREDENTIAL_VAR);
			
			//error_log('DEBUG creds : '.print_r($creds, true));
			
			if ($creds === null) {
				$this->initializeCredentialsForUser($currentUser);
			}
		} else {
			$this->clearCredsSession();
		}
		
		return $currentUser;
	}
	
	public function getCurrentIndividu() {
		$user = $this->getCurrentUser();
		if ($user && !is_string($user)) {
			$clientsMgr = $this->container->get('joueurs_manager');
			if (false) $clientsMgr = new JoueursManager();
			
			$client = $clientsMgr->getJoueurForUser($user->getId());
			if ($client) return $client;
			
			$adminsMgr = $this->container->get('admins_manager');
			if (false) $adminsMgr = new AdministratorsManager();
			
			$admin = $adminsMgr->getAdministratorForUser($user->getId());
			if ($admin) return $admin;
		}
		
		return null;
	}
	
	public function isJoueur() {
		$currIndiv = $this->getCurrentIndividu();
		
		if ($currIndiv instanceof Manu\AsgttBundle\Entity\Joueur) return true;
		return false;
	}
	
	public function isAdmin() {
		$currIndiv = $this->getCurrentIndividu();
		
		if ($currIndiv instanceof Manu\AsgttBundle\Entity\Administrator) {

			return true;
		}
		return false;
	}
	
	protected function initializeCredentialsForUser($user) {
		if (!$user) {
			$this->clearCredsSession();
			return;
		}
		if (is_string($user)) {
			error_log("DEBUG USER STRING : $user");
			$this->clearCredsSession();
			return;
		}
	}
	
	public function getCurrentCredentials() {
		$currentUser = $this->getCurrentUser(); // De la sorte, on force l'initialisation si nécessaire.
		if (!$currentUser) {
			$this->clearCredsSession();
			$this->forceDisconnect();
			return null;
		}
		$session = $this->getSession();
		return $session->get(self::SESSION_CREDENTIAL_VAR);
	}
	
	public function getSession() {
		$session = $this->container->get('session');
		if (!$session->isStarted()) $session->start();
		
		return $session;
	}
	
	
	protected function clearCredsSession() {
		$session = $this->getSession();
		
		// On efface les credentials
		$creds = $session->remove(self::SESSION_CREDENTIAL_VAR);
	}
	
	public function forceDisconnect() {
		$this->container->get('security.context')->setToken(null);
		$this->clearCredsSession();
	}

	
	// ClientProviderInterface
	public function findByAccessToken($accessToken) {
		$em = $this->doctrine->getManager();
		
		return $em->getRepository('SerielUserBundle:User')->find($accessToken);
	}
	public function updateClient(ClientInterface $client) {
		
	}
}
