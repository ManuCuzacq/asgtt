<?php

namespace Manu\AsgttBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Manu\AsgttBundle\Classes\Service;
use Manu\AsgttBundle\Managers\ArticlesManager;
use Manu\AsgttBundle\Managers\SecurityManager;
use Manu\AsgttBundle\Managers\PagesManager;


class AsgttController extends Controller
{
    public function indexAction()
    {
    	/*$em = $this->getDoctrine()->getManager();
    	$articles = $em->getRepository('ManuAsgttBundle:Article')->findAll();
    	*/
    	$secuMgr = $this->get('security_manager');
    	if(false){
    		$secuMgr = new SecurityManager();
    	}
    	
    	$user = $secuMgr->getCurrentIndividu();
    	
    	$articlesMgr = $this->get('articles_manager');
    	if(false){
    		$articlesMgr = new ArticlesManager();
    	}
    	
    	$articles = $articlesMgr->getAllArticles();
    	
        return $this->render('ManuAsgttBundle::layout.html.twig',array('articles'=>$articles,'user'=>$user));
    }
    public function getPageAction($nom){
    	$pageMgr = $this->get('pages_manager');
    	if(false){
    		$pageMgr = new PagesManager();
    	}
    	
    	$page = $pageMgr->getPageForName($nom);
    	return $this->render('ManuAsgttBundle:Pages:page.html.twig',array('page'=>$page));
    }
    
    public function savePageAction($nom){
    	$pageMgr = $this->get('pages_manager');
    	if(false){
    		$pageMgr = new PagesManager();
    	}
    	
    	$page = $pageMgr->getPageForName($nom);
    	$content = $_POST['content'];
    	
    	$page->setContent($content);
    	$pageMgr->save($page,true);
    	
    	return $this->render('ManuAsgttBundle:Pages:pageSaved.html.twig',array('page'=>$page));
    }
}
