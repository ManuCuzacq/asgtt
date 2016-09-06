<?php

namespace Manu\AsgttBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Manu\AsgttBundle\Annotation as SER;
use Manu\AsgttBundle\Entity\Categorie;

/**
 * @ORM\Entity
 * @ORM\Table(name="joueurs",options={"engine"="MyISAM"})
 * @ORM\HasLifecycleCallbacks
 *
 */
class Joueur extends RootObject
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
	 * @ORM\OneToOne(targetEntity="Manu\AsgttBundle\Entity\Adresse")
	 * @ORM\JoinColumn(name="adresse_id", referencedColumnName="id")
	 **/
	protected $adresse;
	
	
	/**
	 * @ORM\Column(type="string", length=120, nullable=true)
	 */
	protected $num_licence;
	
	
	/**
	 * @ORM\Column(type="integer", length=120, nullable=true)
	 */
	protected $pointLicence;
	
	/**
	 * @ORM\Column(type="decimal", length=120, nullable=true)
	 */
	protected $pointMensuel;
	
	/**
	 * @ORM\ManyToOne(targetEntity="Categorie")
	 * @ORM\JoinColumn()
	 */
	protected $categorie;
	
	
	/**
	 * @ORM\Column(type="string", length=120, nullable=true)
	 */
	protected $type_licence;
	
	
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
	
	public function getAdresse() {
		return $this->adresse;
	}
	
	public function setAdresse($adresse){
		$this->adresse = $adresse;
		return $this;
	}
	
	public function getPointMensuel(){
		return $this->pointMensuel;
	}
	
	public function setPointMensuel($pm){
		$this->pointMensuel = $pm;
		return $this;
	}
	
	public function getPointLicence(){
		return $this->pointLicence;
	}
	
	public function setPointLicence($pl){
		$this->pointLicence = $pl;
		return $this;
	}
	
	public function getNumLicence(){
		return $this->num_licence;
	}
	
	public function setNumLicence($num){
		$this->num_licence = $num;
		return $this;
	}
	
	public function getTypeLicence(){
		return $this->type_licence;
	}
	
	public function setTypeLicence($num){
		$this->type_licence = $num;
		return $this;
	}
	
	public function getCategorie(){
		return $this->categorie;
	}
	
	public function setCategorie($cat){
		$this->categorie = $cat;
		return $this;
	}
	
	
}
