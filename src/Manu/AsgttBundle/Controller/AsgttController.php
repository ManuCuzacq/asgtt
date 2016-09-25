<?php

namespace Manu\AsgttBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Manu\AsgttBundle\Classes\Service;
use Manu\AsgttBundle\Managers\ArticlesManager;
use Manu\AsgttBundle\Managers\SecurityManager;
use Manu\AsgttBundle\Managers\PagesManager;
use Manu\AsgttBundle\Entity\Administrator;
use Manu\AsgttBundle\Entity\Joueur;


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
    	$role = 'ANON';
    	if($user instanceof Administrator){
    		$role = 'ADMIN';
    	}
   		if($user instanceof Joueur){
    		$role = 'JOUEUR';
    	}
    	
    	$articlesMgr = $this->get('articles_manager');
    	if(false){
    		$articlesMgr = new ArticlesManager();
    	}
    	
    	$articles = $articlesMgr->getAllArticles();
    	
        return $this->render('ManuAsgttBundle::layout.html.twig',array('articles'=>$articles,'user'=>$user,'role'=>$role));
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
    
    public function modifierArticleAction($id){
    	
    	$articlesMgr = $this->get('articles_manager');
    	if(false){
    		$articlesMgr = new ArticlesManager();
    	}
    	
    	$article = $articlesMgr->getArticle($id);
      
    	return $this->render('ManuAsgttBundle:Articles:modifierArticle.html.twig',array('article'=>$article));
    	
    }
    public function updateArticleAction($id){
        $articlesMgr = $this->get('articles_manager');
    	if(false){
    		$articlesMgr = new ArticlesManager();
    	}
    	
    	$article = $articlesMgr->getArticle($id);
        
        $request = $this->getRequest();
        $article->setTitre($request->get('titre'));
        $article->setContenu($request->get('content'));
        
        $articlesMgr->save($article,true);
        
        return $this->render('ManuAsgttBundle:Articles:updateArticle.html.twig',array('article'=>$article));
        
    }
    public function supprimerArticleAction($id){
        $articlesMgr = $this->get('articles_manager');
    	if(false){
    		$articlesMgr = new ArticlesManager();
    	}
    	
    	$article = $articlesMgr->getArticle($id);
        
        $articlesMgr->remove($article,true);
        return $this->render('ManuAsgttBundle:Articles:deleteArticle.html.twig',array('article_id'=>$id));
    }
}
