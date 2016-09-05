<?php

namespace Manu\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('ManuUserBundle:Default:index.html.twig');
    }
}
