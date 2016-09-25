<?php

namespace Manu\AsgttBundle\Security\Voters;

use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class AnyVoter implements VoterInterface {
	
	protected $container = null;
	
	public function __construct($container) {
		$this->container = $container;
	}
	
	public function supportsAttribute($attribute) {
		return true;
	}
	
	public function supportsClass($class) {
		return true;
	}
	
	public function vote(TokenInterface $token, $obj, array $attributes) {
		return VoterInterface::ACCESS_GRANTED;
	}
}