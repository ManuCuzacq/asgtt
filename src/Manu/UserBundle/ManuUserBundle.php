<?php

namespace Manu\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class ManuUserBundle extends Bundle
{
	public function getParent() {
		return 'FOSUserBundle';
	}
}
