<?php

namespace Manu\AsgttBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Manu\AsgttBundle\Classes\Service;
use Manu\AsgttBundle\Managers\ArticlesManager;


class AsgttController extends Controller
{
    public function indexAction()
    {
    	/*$em = $this->getDoctrine()->getManager();
    	$articles = $em->getRepository('ManuAsgttBundle:Article')->findAll();
    	*/
    	
    	$articlesMgr = $this->get('articles_manager');
    	if(false){
    		$articlesMgr = new ArticlesManager();
    	}
    	
    	$articles = $articlesMgr->getAllArticles();
    	
        return $this->render('ManuAsgttBundle::layout.html.twig',array('articles'=>$articles));
    }
}
