<?php
namespace Manu\AsgttBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="adresse",options={"engine":"MyISAM"})
 */
class Adresse extends RootObject
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
	 protected $addr1;
	 
	 /**
	  * @ORM\Column(type="string", length=255, unique=false, nullable=false)
	  */
	 protected $addr2;
	 
	 /**
	  * @ORM\Column(type="string", length=255, unique=false, nullable=false)
	  */
	 protected $addr3;
	 
	 /**
	  * @ORM\Column(type="string", length=6, unique=false, nullable=false)
	  */
	 protected $cp;
	 
	 /**
	  * @ORM\Column(type="string", length=255, unique=false, nullable=false)
	  */
	 protected $ville;
	 
	 
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
    public function setAddr1($addr1)
    {
        $this->addr1 = $addr1;

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

    /**
     * Set addr2
     *
     * @param string $addr2
     *
     * @return Adresse
     */
    public function setAddr2($addr2)
    {
        $this->addr2 = $addr2;

        return $this;
    }

    /**
     * Get addr2
     *
     * @return string
     */
    public function getAddr2()
    {
        return $this->addr2;
    }

    /**
     * Set addr3
     *
     * @param string $addr3
     *
     * @return Adresse
     */
    public function setAddr3($addr3)
    {
        $this->addr3 = $addr3;

        return $this;
    }

    /**
     * Get addr3
     *
     * @return string
     */
    public function getAddr3()
    {
        return $this->addr3;
    }

    /**
     * Set cp
     *
     * @param string $cp
     *
     * @return Adresse
     */
    public function setCp($cp)
    {
        $this->cp = $cp;

        return $this;
    }

    /**
     * Get cp
     *
     * @return string
     */
    public function getCp()
    {
        return $this->cp;
    }

    /**
     * Set ville
     *
     * @param string $ville
     *
     * @return Adresse
     */
    public function setVille($ville)
    {
        $this->ville = $ville;

        return $this;
    }

    /**
     * Get ville
     *
     * @return string
     */
    public function getVille()
    {
        return $this->ville;
    }
}
