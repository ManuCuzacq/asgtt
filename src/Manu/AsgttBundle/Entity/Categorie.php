<?php
namespace Manu\AsgttBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="categorie",options={"engine":"MyISAM"})
 */
class Categorie extends RootObject
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
	  * @ORM\ManyToOne(targetEntity="Joueur")
	  * @ORM\JoinColumn(name="joueur_id", referencedColumnName="id")
	  */
	 protected $joueur;
	 
	 
	 public function getId(){
	 	return $this->id;
	 }


    /**
     * Set nom
     *
     * @param string $nom
     *
     * @return Categorie
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
    public function getAddr1()
    {
        return $this->addr1;
    }
    
    
    public function setJoueur($joueur){
    	$this->joueur = $joueur;
    	return $this;
    }
    
    public function getJoueur(){
    	return $this->joueur;
    }
}
