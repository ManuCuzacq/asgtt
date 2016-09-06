<?php
namespace Manu\AsgttBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="page",options={"engine":"MyISAM"})
 */
class Page extends RootObject
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
	 protected $nom;
	 
	
	 /**
	  * @ORM\Column(type="string", length=255, unique=false, nullable=false)
	  */
	 protected $content;
	 
	
	 	 
	 public function getId(){
	 	return $this->id;
	 }


    /**
     * Set addr1
     *
     * @param string $addr1
     *
     * @return Adresse
     */
    public function setNom($nom)
    {
        $this->nom = $nom;

        return $this;
    }

    /**
     * Get addr1
     *
     * @return string
     */
    public function getNom()
    {
        return $this->nom;
    }

    /**
     * Set addr2
     *
     * @param string $addr2
     *
     * @return Adresse
     */
    public function setContent($content)
    {
        $this->content = $content;

        return $this;
    }

    /**
     * Get addr2
     *
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }
}
