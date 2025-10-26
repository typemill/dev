<?php

namespace Typemill\Controllers;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Typemill\Models\Validation;
use Typemill\Models\License;
use Typemill\Static\Translations;
use Typemill\Models\ApiCalls;

class ControllerApiSystemVersions extends Controller
{
	public function checkVersions(Request $request, Response $response)
	{
		$params 			= $request->getParsedBody();
		$error 				= false;

		# validate input
		$validate 			= new Validation();
		$vresult 			= $validate->checkVersions($params);
		if($vresult !== true)
		{
			$response->getBody()->write(json_encode([
				'message' 	=> Translations::translate('The version check failed because of invalid parameters.')
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
		}

		$type 				= $params['type'];
		$data 				= $params['data'];
		$url 				= 'https://typemill.net/api/v1/checkversion';

		if($type == 'plugins')
		{
			$pluginList = '';
			foreach($data as $name => $plugin)
			{
				$pluginList .= $name . ',';
			}
			
			$url = 'https://plugins.typemill.net/api/v1/getplugins?plugins=' . urlencode($pluginList);
		}
		if($type == 'themes')
		{
			$themeList = '';
			foreach($data as $name => $theme)
			{
				$themeList .= $name . ',';
			}
			
			$url = 'https://themes.typemill.net/api/v1/getthemes?themes=' . urlencode($themeList);
		}	    

		$license = new License();
		$authstring = $license->getPublicKeyPem();
		if(!$authstring)
		{
			$response->getBody()->write(json_encode([
				'message' 	=> Translations::translate('Please check if there is a readable file public_key.pem in your settings folder.')
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
		}

		$authstring = hash('sha256', substr($authstring, 0, 50));
		$authHeader = "Authorization: " . $authstring;

	    $apiservice = new ApiCalls();
	    $apiResponse = $apiservice->makeGetCall($url, $authHeader);

	    if (!$apiResponse)
	    {
	        $response->getBody()->write(json_encode([
	            'message' 	=> 'Could not make the call for the update check',
	            'error'		=> $apiservice->getError()
	        ]));

	        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
	    }
	    
		$versions = json_decode($apiResponse, true);

		$updateVersions 	= [];

		if($type == 'system')
		{
				$latestVersion 		= $versions['system']['typemill'] ?? false;
				$installedVersion 	= $data ?? false;
				if($latestVersion && $installedVersion && version_compare($latestVersion, $installedVersion) > 0)
				{
					$updateVersions['system'] = $latestVersion; 
				}
		}
		elseif(isset($versions[$type]))
		{
			foreach($versions[$type] as $name => $details)
			{
				$latestVersion 		= $details['version'] ?? false;
				$installedVersion 	= $data[$name] ?? false;
				if($latestVersion && $installedVersion && version_compare($latestVersion, $installedVersion) > 0)
				{
					$updateVersions[$name] = $details; 
				}
			}
		}

		$response->getBody()->write(json_encode([
			$type => $updateVersions
		]));

		return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
	}
}