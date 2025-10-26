<?php

namespace Typemill\Controllers;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Routing\RouteContext;
use Typemill\Models\Validation;
use Typemill\Models\Navigation;
use Typemill\Models\Multilang;
use Typemill\Models\Meta;
use Typemill\Static\Translations;
use Typemill\Events\OnMetaDefinitionsLoaded;

class ControllerApiAuthorMeta extends Controller
{
	public function getMeta(Request $request, Response $response, $args)
	{
		$url 				= $request->getQueryParams()['url'] ?? false;
		$urlinfo 			= $this->c->get('urlinfo');
		$langattr 			= $this->settings['langattr'];

		$navigation 		= new Navigation();

		# configure multilang or multiproject
		$navigation->setProject($this->settings, $url);

		$item 				= $navigation->getItemForUrl($url, $urlinfo, $langattr);
		if(!$item)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('page not found'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		$meta = new Meta();

		$metadata = $meta->getMetaData($item);

		if(
			!$metadata or 
			!isset($metadata['meta']['owner']) OR 
			!$metadata['meta']['owner'] OR 
			!isset($metadata['meta']['pageid']) OR
			!isset($metadata['meta']['modified']) OR
			!$metadata['meta']['modified']
#			$metadata['meta']['pageid']
		)
		{
			$metadata = $meta->addMetaDefaults($metadata, $item, $this->settings['author'], $request->getAttribute('c_username'));
		}
		
		# if user is not allowed to perform this action (e.g. not admin)
		if(!$this->userroleIsAllowed($request->getAttribute('c_userrole'), 'content', 'read'))
		{
			# then check if user is the owner of this content
			if(!$this->userIsAllowed($request->getAttribute('c_username'), $metadata))
			{
				$response->getBody()->write(json_encode([
					'message' 	=> Translations::translate('You do not have enough rights.'),
				]));

				return $response->withHeader('Content-Type', 'application/json')->withStatus(403);				
			}
		}

		# if item is a folder
		if($item->elementType == "folder" && isset($item->contains))
		{
			$metadata['meta']['contains'] = isset($metadata['meta']['contains']) ? $metadata['meta']['contains'] : $item->contains;

			# get global metadefinitions
			$metadefinitions = $meta->getMetaDefinitions($this->settings, $folder = true);
		}
		else
		{
			# get global metadefinitions
			$metadefinitions = $meta->getMetaDefinitions($this->settings, $folder = false);
		}

		# add multilanguage definitions if active
#		$multilang = new Multilang();
#		$metadefinitions = $multilang->addMultilangDefinitions($metadefinitions, $this->settings);

		# update metadefinitions from plugins.
		$metadefinitions = $this->c->get('dispatcher')->dispatch(new OnMetaDefinitionsLoaded($metadefinitions),'onMetaDefinitionsLoaded')->getData();

		# cleanup metadata to the current metadefinitions (e.g. strip out deactivated plugins)
		$metacleared = [];

		# store the metadata-scheme for frontend, so frontend does not use obsolete data
		$metascheme = [];

		foreach($metadefinitions as $tabname => $tabfields )
		{
			# add userroles and other datasets
			$metadefinitions[$tabname]['fields'] = $this->addDatasets($tabfields['fields']);

			$tabfields = $this->flattenTabFields($tabfields['fields'],[]);

			$metacleared[$tabname] 	= [];

			foreach($tabfields as $fieldname => $fielddefinitions)
			{
				$metascheme[$tabname][$fieldname] = true;

				$metacleared[$tabname][$fieldname] = isset($metadata[$tabname][$fieldname]) ? $metadata[$tabname][$fieldname] : null;
			}
		}

		# store the metascheme in cache for frontend
#		$writeMeta->updateYaml('cache', 'metatabs.yaml', $metascheme);

		$response->getBody()->write(json_encode([
			'metadata' 			=> $metacleared, 
			'metadefinitions'	=> $metadefinitions, 
		]));

		return $response->withHeader('Content-Type', 'application/json');
	}

	public function updateMeta(Request $request, Response $response, $args)
	{
		$params 			= $request->getParsedBody();
		$validate			= new Validation();
		$validInput 		= $validate->metaInput($params);
		if($validInput !== true)
		{
			$errors 		= $validate->returnFirstValidationErrors($validInput);
			$response->getBody()->write(json_encode([
				'message' 	=> reset($errors),
				'errors' 	=> $errors
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
		}

		$urlinfo 			= $this->c->get('urlinfo');
		$langattr 			= $this->settings['langattr'];
		
		$navigation 		= new Navigation();

		# configure multilang or multiproject
		$navigation->setProject($this->settings, $params['url']);

		$item 				= $navigation->getItemForUrl($params['url'], $urlinfo, $langattr);

		if(!$item)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('page not found'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		$meta 				= new Meta();
		$metadata 			= $meta->getMetaData($item);

		# if user is not allowed to perform this action (e.g. not admin)
		if(!$this->userroleIsAllowed($request->getAttribute('c_userrole'), 'content', 'update'))
		{
			# then check if user is the owner of this content
			if(!$this->userIsAllowed($request->getAttribute('c_username'), $metadata))
			{
				$response->getBody()->write(json_encode([
					'message' 	=> Translations::translate('You do not have enough rights.'),
				]));

				return $response->withHeader('Content-Type', 'application/json')->withStatus(403);				
			}
		}

		# if item is a folder
		if($item->elementType == "folder" && isset($item->contains))
		{
			$metadata['meta']['contains'] = isset($metadata['meta']['contains']) ? $metadata['meta']['contains'] : $item->contains;

			# get global metadefinitions
			$metadefinitions = $meta->getMetaDefinitions($this->settings, $folder = true);
		}
		else
		{
			# get global metadefinitions
			$metadefinitions = $meta->getMetaDefinitions($this->settings, $folder = false);
		}

		# update metadefinitions from plugins.
		$metadefinitions = $this->c->get('dispatcher')->dispatch(new OnMetaDefinitionsLoaded($metadefinitions),'onMetaDefinitionsLoaded')->getData();

		$tabdefinitions = $metadefinitions[$params['tab']] ?? false;
		if(!$tabdefinitions)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('Tab not found'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}
		$tabdefinitions['fields'] = $this->addDatasets($tabdefinitions['fields']);
		$tabdefinitions = $this->flattenTabFields($tabdefinitions['fields'], []);

		$validated['data'] 	= $validate->recursiveValidation($tabdefinitions, $params['data']);

		if(!empty($validate->errors))
		{
			$errors[$params['tab']] = $validate->errors;
			$response->getBody()->write(json_encode([
				'message' 	=> Translations::translate('Please correct your input.'),
				'errors' 	=> $errors
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
		}

#		$navigation 		= new Navigation();

		$naviFileName 		= $navigation->getNaviFileNameForPath($item->path);
		$extended 			= $navigation->getExtendedNavigation($urlinfo, $this->settings['langattr'], $naviFileName);
		$draftNavigation 	= false;
		$updateDraftNavi 	= false;

		if($params['tab'] == 'meta')
		{
			# if manual date has been modified
			if( $this->hasChanged($params['data'], $metadata['meta'], 'manualdate'))
			{
				# update the time
				$validated['data']['time'] = date('H-i-s', time());

				# if it is a post, then rename the post
				if($item->elementType == "file" && strlen($item->order) == 12)
				{
					# create file-prefix with date
					$metadate 	= $params['data']['manualdate'];
					if($metadate == '')
					{ 
						$metadate = $metadata['meta']['created']; 
					} 
					$datetime 	= $metadate . '-' . $params['data']['time'];
					$datetime 	= implode(explode('-', $datetime));
					$datetime	= substr($datetime,0,12);

					# create the new filename
					$pathWithoutFile 	= str_replace($item->originalName, "", $item->path);
					$newPathWithoutType	= $pathWithoutFile . $datetime . '-' . $item->slug;

					$renameresults = $meta->renamePost($item->pathWithoutType, $newPathWithoutType);

					# make sure the whole navigation with base-navigation and folder-navigation is updated. Bad for performance but rare case
				    $navigation->clearNavigation();

					# RECREATE ITEM AND NAVIGATION, because we rename filename first and later update the meta-content
					$draftNavigation 	= $navigation->getFullDraftNavigation($urlinfo, $this->settings['langattr']);
					$draftNavigation 	= $navigation->setActiveNaviItemsWithKeyPath($draftNavigation, $item->keyPathArray);
					$item 				= $navigation->getItemWithKeyPath($draftNavigation, $item->keyPathArray);
				}
			}

			# if folder has changed and contains pages instead of posts or posts instead of pages
			if($item->elementType == "folder" && isset($params['data']['contains']) && isset($metadata['meta']['contains']) && $this->hasChanged($params['data'], $metadata['meta'], 'contains'))
			{				
				if($meta->folderContainsFolders($item))
				{
					$response->getBody()->write(json_encode([
						'message' => Translations::translate('The folder contains another folder so we cannot transform it. Please make sure there are only files in this folder.'),
					]));

					return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
				}

				if($params['data']['contains'] == "posts" && !$meta->transformPagesToPosts($item))
				{
					$response->getBody()->write(json_encode([
						'message' => Translations::translate('One or more files could not be transformed.')
					]));

					return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
				}

				if($params['data']['contains'] == "pages" && !$meta->transformPostsToPages($item))
				{
					$response->getBody()->write(json_encode([
						'message' => Translations::translate('One or more files could not be transformed.')
					]));

					return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
				}

				# this will only update the basic draft navigation but we also have to update the folder navigation
			    # $navigation->clearNavigation([$naviFileName, $naviFileName. "-extened"]);
				# other solution: 
				# $fakeFolderpath = $item->getPath;
				# $fakeFolderpath .= '/getMyParent';
				# $naviFolderName = $navigation->getNaviFileNameForPath($fakeFolderPath);
			    # $navigation->clearNavigation([$naviFolderName, $naviFolderName. "-extened"]);

			    # clear the whole navigation to make sure that folder navigation is recreated correctly
			    $navigation->clearNavigation();
			    $updateDraftNavi = true;
			}

			# normalize the meta-input
			$validated['data']['navtitle'] 	= (isset($params['data']['navtitle']) && $params['data']['navtitle'] !== null )? $params['data']['navtitle'] : '';
			$validated['data']['hide'] 		= (isset($params['data']['hide']) && $params['data']['hide'] !== null) ? $params['data']['hide'] : false;
			$validated['data']['noindex'] 	= (isset($params['data']['noindex']) && $params['data']['noindex'] !== null) ? $params['data']['noindex'] : false;

			# input values are empty but entry in structure exists
			if(
				!$params['data']['hide'] 
				&& $params['data']['navtitle'] == "" 
				&& isset($extended[$item->urlRelWoF])
			)
			{
				$navigation->clearNavigation([$naviFileName, $naviFileName . '-extended']);
				$updateDraftNavi = true;
			}
			elseif(
				# check if navtitle or hide-value has been changed
				($this->hasChanged($params['data'], $metadata['meta'], 'navtitle'))
				OR 
				($this->hasChanged($params['data'], $metadata['meta'], 'hide'))
				OR
				($this->hasChanged($params['data'], $metadata['meta'], 'noindex'))
				OR
				($this->hasChanged($params['data'], $metadata['meta'], 'alloweduser'))
				OR
				($this->hasChanged($params['data'], $metadata['meta'], 'allowedrole'))
			)
			{
				$navigation->clearNavigation([$naviFileName, $naviFileName . '-extended']);
				$updateDraftNavi = true;
			}
		}

		# add the new/edited metadata
		$metadata[$params['tab']] = $validated['data'];

		# store the metadata
		$store = $meta->updateMeta($metadata, $item);

		if($store === true)
		{
			if($updateDraftNavi)
			{
				$draftNavigation 	= $navigation->getFullDraftNavigation($urlinfo, $this->settings['langattr']);
				$draftNavigation 	= $navigation->setActiveNaviItemsWithKeyPath($draftNavigation, $item->keyPathArray);
				$item 				= $navigation->getItemWithKeyPath($draftNavigation, $item->keyPathArray);				
			}

			$response->getBody()->write(json_encode([
				'navigation'	=> $draftNavigation,
				'item'			=> $item,
				'rename' 		=> $renameresults ?? false
			]));

			return $response->withHeader('Content-Type', 'application/json');
		}

		$response->getBody()->write(json_encode([
			'message' 	=> $store,
		]));

		return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
	}

	# we have to flatten field definitions for tabs if there are fieldsets in it
	public function flattenTabFields($tabfields, $flattab, $fieldset = null)
	{
		foreach($tabfields as $name => $field)
		{
			if($field['type'] == 'fieldset')
			{
				$flattab = $this->flattenTabFields($field['fields'], $flattab, $name);
			}
			else
			{
				# add the name of the fieldset so we know to which fieldset it belongs for references
				if($fieldset)
				{
					$field['fieldset'] = $fieldset;
				}
				$flattab[$name] = $field;
			}
		}
		return $flattab;
	}
}