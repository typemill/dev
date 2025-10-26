<?php

namespace Typemill\Controllers;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Typemill\Models\Validation;
use Typemill\Models\Extension;
use Typemill\Models\Settings;
use Typemill\Static\Translations;

class ControllerApiSystemPlugins extends Controller
{
	public function updatePlugin(Request $request, Response $response)
	{
		$params 			= $request->getParsedBody();
		$pluginname 		= $params['plugin'];
		$plugininput 		= $params['settings'];

		$extension 			= new Extension();
		$formdefinitions 	= $extension->getPluginDefinition($pluginname);
		$formdefinitions 	= $this->addDatasets($formdefinitions['forms']['fields']);
#		$plugindata 		= [];

		# validate input
		$validator 			= new Validation();
		$validatedOutput 	= $validator->recursiveValidation($formdefinitions, $plugininput);
		if(!empty($validator->errors))
		{
			$response->getBody()->write(json_encode([
				'message' 	=> Translations::translate('Please correct your input.'),
				'errors' 	=> $validator->errors
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
		}

		# keep the active setting
		$validatedOutput['active'] = false;
		if(isset($plugininput['active']) && $plugininput['active'] == true)
		{
			$validatedOutput['active'] = true;
		}

		# store updated settings here
		$settingsModel 	= new Settings();
		$securityFields = $settingsModel->findSecurityDefinitions($formdefinitions);
		if(!empty($securityFields))
		{
			$splitSettings = $settingsModel->extractSecuritySettings($validatedOutput, $securityFields);
			$validatedOutput = $splitSettings['settings'];

			if($splitSettings['securitySettings'] && !empty($splitSettings['securitySettings']))
			{
				$settingsModel->updateSecuritySettings($splitSettings['securitySettings'], 'plugins', $pluginname);
			}
		}

		$updatedSettings 	= $settingsModel->updateSettings($validatedOutput, 'plugins', $pluginname);

		$response->getBody()->write(json_encode([
			'message' => Translations::translate('settings have been saved')
		]));

		return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
	}
}