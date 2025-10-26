<?php

namespace Typemill\Middleware;

use Psr\Http\Server\MiddlewareInterface;
use Slim\Routing\RouteParser;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response;

class WebRedirectIfAuthenticated implements MiddlewareInterface
{	
	private $router;

	private $settings;
	
	public function __construct(RouteParser $router, $settings)
	{
		$this->router 	= $router;
		$this->settings = $settings;
	}

	public function process(Request $request, RequestHandler $handler) :Response
	{
		$authenticated = ( 
				(isset($_SESSION['username'])) && 
				(isset($_SESSION['login']))
			)
			? true : false;

		if($authenticated)
		{

			$editor = (isset($this->settings['editor']) && $this->settings['editor'] == 'visual') ? 'visual' : 'raw';

			$response = new Response();
			
			return $response->withHeader('Location', $this->router->urlFor('content.' . $editor))->withStatus(302);
		}
	
		$response = $handler->handle($request);
	
		return $response;
	}
}