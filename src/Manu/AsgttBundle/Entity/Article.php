<?php
namespace Manu\AsgttBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="article",options={"engine":"MyISAM"})
 */
class Article extends RootObject
{
	/**
	 * @ORM\Id
	 * @ORM\Column(type="integer")
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	 protected $id;
	 
	 /**
	  * @ORM\Column(type="string", length=255, unique=false, nullable=false)
	  */
	 protected $titre;
	 
	 /**
	  * @ORM\Column(type="string", length=999, unique=false, nullable=false)
	  */
	 protected $contenu;
	 
	 public function getId(){
	 	return $this->id;
	 }
	 
	 public function getTitre(){
	 	return $this->titre;
	 }
	 
	 public function setTitre($titre){
	 	$this->titre = $titre;
	 	return $this;
	 }
	 
	 public function setContenu($content){
	 	$this->contenu = $content;
	 	return $this;
	 }
	 
	 public function getContenu(){
	 	return $this->contenu;
	 }
}