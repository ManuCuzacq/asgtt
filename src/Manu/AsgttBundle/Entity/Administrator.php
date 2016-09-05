<?php

namespace Manu\AsgttBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Manu\AsgttBundle\Annotation as SER;

/**
 * @ORM\Entity
 * @ORM\Table(name="administrator",options={"engine"="MyISAM"})
 * @ORM\HasLifecycleCallbacks
 * 
 */
class Administrator extends RootObject
{
	public function __construct()
	{
		parent::__construct();
	}
	
	/**
	 * @ORM\Id
	 * @ORM\Column(type="integer")
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	protected $id;
	

	/**
	 * @ORM\Column(type="string", length=300, nullable=false)
	 */
	protected $nom;
	
	/**
	 * @ORM\Column(type="string", length=300, nullable=true)
	 */
	protected $prenom;
	
	/**
	 * @ORM\Column(type="string", length=120, nullable=true)
	 */
	protected $email;
	
	/**
	 * @ORM\OneToOne(targetEntity="Manu\UserBundle\Entity\User")
	 * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
	 **/
	protected $user;
	
	/**
	 * Get id
	 *
	 * @return integer
	 */
	public function getId() {
		return $this->id;
	}


    /**
     * Set nom
     *
     * @param string $nom
     *
     * @return Administrator
     */
    public function setNom($nom)
    {
        $this->nom = $nom;

        return $this;
    }

    /**
     * Get nom
     *
     * @return string
     */
    public function getNom()
    {
        return $this->nom;
    }

    /**
     * Set prenom
     *
     * @param string $prenom
     *
     * @return Administrator
     */
    public function setPrenom($prenom)
    {
        $this->prenom = $prenom;

        return $this;
    }

    /**
     * Get prenom
     *
     * @return string
     */
    public function getPrenom()
    {
        return $this->prenom;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return Administrator
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set user
     *
     * @param \Seriel\UserBundle\Entity\User $user
     *
     * @return Administrator
     */
    public function setUser(\Manu\UserBundle\Entity\User $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \Manu\UserBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }
    
    public function getNiceName() {
    	return trim($this->prenom.' '.$this->nom);
    }
    
    public function __toString() {
    	return $this->getNiceName();
    }
}
