<?php

namespace Typemill\Controllers;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Routing\RouteContext;
use Typemill\Models\Navigation;
use Typemill\Models\Validation;
use Typemill\Models\Content;
use Typemill\Models\Meta;
use Typemill\Static\Translations;
use Typemill\Events\OnPageUpdated;

class ControllerApiAuthorBlock extends Controller
{
	public function addBlock(Request $request, Response $response, $args)
	{
		$params 			= $request->getParsedBody();
		$validate			= new Validation();
		$validInput 		= $validate->blockInput($params);
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

		# configure multilang and multiproject
		$navigation->setProject($this->settings, $params['url']);

		$item 				= $navigation->getItemForUrl($params['url'], $urlinfo, $langattr);
		if(!$item)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('page not found'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		# if user is not allowed to perform this action (e.g. not admin)
		if(!$this->userroleIsAllowed($request->getAttribute('c_userrole'), 'content', 'update'))
		{
			# then check if user is the owner of this content
			$meta = new Meta();
			$metadata = $meta->getMetaData($item);
			if(!$this->userIsAllowed($request->getAttribute('c_username'), $metadata))
			{
				$response->getBody()->write(json_encode([
					'message' 	=> Translations::translate('You do not have enough rights.'),
				]));

				return $response->withHeader('Content-Type', 'application/json')->withStatus(403);				
			}
		}

		$content 			= new Content($urlinfo['baseurl'], $this->settings, $this->c->get('dispatcher'));
		$draftMarkdown  	= $content->getDraftMarkdown($item);
		$oldMarkdown 		= $draftMarkdown;

		# if it is a new content-block
		if($params['block_id'] > 9999)
		{
			# set the id of the markdown-block (it will be one more than the actual array, so count is perfect) 
			$id = count($draftMarkdown);

			# add the new markdown block to the page content
			$draftMarkdown[] = $params['markdown'];
		}
		elseif(($params['block_id'] == 0) OR !isset($draftMarkdown[$params['block_id']]))
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('Block-id not found.'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}
		else
		{
			# insert new markdown block
			array_splice( $draftMarkdown, $params['block_id'], 0, $params['markdown'] );			
			$id = $params['block_id'];
		}

		$store = $content->saveDraftMarkdown($item, $draftMarkdown);
		if($store !== true)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('We could not store the content: ') . $store,
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
		}

		$draftMarkdownHtml	= $content->addDraftHtml($draftMarkdown);

		$onPageUpdated = [
			'oldMarkdown'		=> $content->markdownArrayToText($oldMarkdown),
			'newMarkdown'		=> $content->markdownArrayToText($draftMarkdown),
			'username'			=> $request->getAttribute('c_username'),
			'item'				=> $item,
		];
		$this->c->get('dispatcher')->dispatch(new OnPageUpdated($onPageUpdated), 'onPageUpdated');

		# if it was published before, then we need to refresh the navigation
		if($item->status == 'published')
		{
			$naviFileName 		= $navigation->getNaviFileNameForPath($item->path);
		    $navigation->clearNavigation([$naviFileName]);

			$draftNavigation 	= $navigation->getFullDraftNavigation($urlinfo, $this->settings['langattr']);
			$draftNavigation 	= $navigation->setActiveNaviItemsWithKeyPath($draftNavigation, $item->keyPathArray);
			$item 				= $navigation->getItemWithKeyPath($draftNavigation, $item->keyPathArray);
			
			$response->getBody()->write(json_encode([
				'content'		=> $draftMarkdownHtml,
				'navigation'	=> $draftNavigation,
				'item'			=> $item,
			]));
	
			return $response->withHeader('Content-Type', 'application/json');
		}

		$response->getBody()->write(json_encode([
			'content'		=> $draftMarkdownHtml,
			'navigation'	=> false,
			'item'			=> false,
		]));

		return $response->withHeader('Content-Type', 'application/json');
	}

	public function moveBlock(Request $request, Response $response, $args)
	{
		$params 			= $request->getParsedBody();
		$validate			= new Validation();
		$validInput 		= $validate->blockMove($params);
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

		# configure multilang and multiproject
		$navigation->setProject($this->settings, $params['url']);

		$item 				= $navigation->getItemForUrl($params['url'], $urlinfo, $langattr);
		if(!$item)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('page not found'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		# if user is not allowed to perform this action (e.g. not admin)
		if(!$this->userroleIsAllowed($request->getAttribute('c_userrole'), 'content', 'update'))
		{
			# then check if user is the owner of this content
			$meta = new Meta();
			$metadata = $meta->getMetaData($item);
			if(!$this->userIsAllowed($request->getAttribute('c_username'), $metadata))
			{
				$response->getBody()->write(json_encode([
					'message' 	=> Translations::translate('You do not have enough rights.'),
				]));

				return $response->withHeader('Content-Type', 'application/json')->withStatus(403);				
			}
		}

		$content 			= new Content($urlinfo['baseurl'], $this->settings, $this->c->get('dispatcher'));

		$draftMarkdown  	= $content->getDraftMarkdown($item);
		$oldMarkdown 		= $draftMarkdown;

		if(!isset($draftMarkdown[$params['index_old']]))
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('Block-id not found.'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		$extract = array_splice($draftMarkdown, $params['index_old'], 1);
		array_splice($draftMarkdown, $params['index_new'], 0, $extract);
	
		$store = $content->saveDraftMarkdown($item, $draftMarkdown);
		if($store !== true)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('We could not store the content: ') . $store,
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
		}

		$draftMarkdownHtml	= $content->addDraftHtml($draftMarkdown);

		$onPageUpdated = [
			'oldMarkdown'		=> $content->markdownArrayToText($oldMarkdown),
			'newMarkdown'		=> $content->markdownArrayToText($draftMarkdown),
			'username'			=> $request->getAttribute('c_username'),
			'item'				=> $item,
		];
		$this->c->get('dispatcher')->dispatch(new OnPageUpdated($onPageUpdated), 'onPageUpdated');

		# if it was published before, then we need to refresh the navigation
		if($item->status == 'published')
		{
			$naviFileName 		= $navigation->getNaviFileNameForPath($item->path);
		    $navigation->clearNavigation([$naviFileName]);

			$draftNavigation 	= $navigation->getFullDraftNavigation($urlinfo, $this->settings['langattr']);
			$draftNavigation 	= $navigation->setActiveNaviItemsWithKeyPath($draftNavigation, $item->keyPathArray);
			$item 				= $navigation->getItemWithKeyPath($draftNavigation, $item->keyPathArray);

			$response->getBody()->write(json_encode([
				'content'		=> $draftMarkdownHtml,
				'navigation'	=> $draftNavigation,
				'item'			=> $item,
			]));
	
			return $response->withHeader('Content-Type', 'application/json');
		}

		$response->getBody()->write(json_encode([
			'content'		=> $draftMarkdownHtml,
			'navigation'	=> false,
			'item'			=> false,
		]));

		return $response->withHeader('Content-Type', 'application/json');
	}

	public function updateBlock(Request $request, Response $response, $args)
	{
		$params 			= $request->getParsedBody();
		$validate			= new Validation();
		$validInput 		= $validate->blockInput($params);
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

		# configure multilang and multiproject
		$navigation->setProject($this->settings, $params['url']);

		$item 				= $navigation->getItemForUrl($params['url'], $urlinfo, $langattr);
		if(!$item)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('page not found'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		# if user is not allowed to perform this action (e.g. not admin)
		if(!$this->userroleIsAllowed($request->getAttribute('c_userrole'), 'content', 'update'))
		{
			# then check if user is the owner of this content
			$meta = new Meta();
			$metadata = $meta->getMetaData($item);
			if(!$this->userIsAllowed($request->getAttribute('c_username'), $metadata))
			{
				$response->getBody()->write(json_encode([
					'message' 	=> Translations::translate('You do not have enough rights.'),
				]));

				return $response->withHeader('Content-Type', 'application/json')->withStatus(403);				
			}
		}

		$content 			= new Content($urlinfo['baseurl'], $this->settings, $this->c->get('dispatcher'));

		$draftMarkdown  	= $content->getDraftMarkdown($item);
		$oldMarkdown 		= $draftMarkdown;

		if(!isset($draftMarkdown[$params['block_id']]))
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('Block-id not found.'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}
		elseif($params['block_id'] == 0)
		{
			# if it is the title, then delete the "# " if it exists
			$blockMarkdown = trim($params['markdown'], "#");
			
			# store the markdown-headline in a separate variable
			$blockMarkdownTitle = '# ' . trim($blockMarkdown);
			
			# add the markdown-headline to the page-markdown
			$draftMarkdown[0] = $blockMarkdownTitle;
		}
		else
		{
			# update the markdown block in the page content
			$draftMarkdown[$params['block_id']] = $params['markdown'];
		}

		$store = $content->saveDraftMarkdown($item, $draftMarkdown);
		if($store !== true)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('We could not store the content: ') . $store,
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
		}

		$draftMarkdownHtml	= $content->addDraftHtml($draftMarkdown);

		$onPageUpdated = [
			'oldMarkdown'		=> $content->markdownArrayToText($oldMarkdown),
			'newMarkdown'		=> $content->markdownArrayToText($draftMarkdown),
			'username'			=> $request->getAttribute('c_username'),
			'item'				=> $item,
		];
		$this->c->get('dispatcher')->dispatch(new OnPageUpdated($onPageUpdated), 'onPageUpdated');

		# if it was published before, then we need to refresh the navigation
		if($item->status == 'published')
		{
			$naviFileName 		= $navigation->getNaviFileNameForPath($item->path);
		    $navigation->clearNavigation([$naviFileName]);

			$draftNavigation 	= $navigation->getFullDraftNavigation($urlinfo, $this->settings['langattr']);
			$draftNavigation 	= $navigation->setActiveNaviItemsWithKeyPath($draftNavigation, $item->keyPathArray);
			$item 				= $navigation->getItemWithKeyPath($draftNavigation, $item->keyPathArray);

			$response->getBody()->write(json_encode([
				'content'		=> $draftMarkdownHtml,
				'navigation'	=> $draftNavigation,
				'item'			=> $item,
			]));
	
			return $response->withHeader('Content-Type', 'application/json');
		}

		$response->getBody()->write(json_encode([
			'content'		=> $draftMarkdownHtml,
			'navigation'	=> false,
			'item'			=> false,
		]));

		return $response->withHeader('Content-Type', 'application/json');
	}	

	public function deleteBlock(Request $request, Response $response, $args)
	{
		$params 			= $request->getParsedBody();
		$validate			= new Validation();
		$validInput 		= $validate->blockDelete($params);
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

		# configure multilang and multiproject
		$navigation->setProject($this->settings, $params['url']);

		$item 				= $navigation->getItemForUrl($params['url'], $urlinfo, $langattr);
		if(!$item)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('page not found'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		# if user is not allowed to perform this action (e.g. not admin)
		if(!$this->userroleIsAllowed($request->getAttribute('c_userrole'), 'content', 'update'))
		{
			# then check if user is the owner of this content
			$meta = new Meta();
			$metadata = $meta->getMetaData($item);
			if(!$this->userIsAllowed($request->getAttribute('c_username'), $metadata))
			{
				$response->getBody()->write(json_encode([
					'message' 	=> Translations::translate('You do not have enough rights.'),
				]));

				return $response->withHeader('Content-Type', 'application/json')->withStatus(403);				
			}
		}

		$content 			= new Content($urlinfo['baseurl'], $this->settings, $this->c->get('dispatcher'));

		$draftMarkdown  	= $content->getDraftMarkdown($item);
		$oldMarkdown 		= $draftMarkdown;

		# check if id exists
		if(!isset($draftMarkdown[$params['block_id']]))
		{ 
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('The ID of the content-block is wrong.'),
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
		}

		$contentBlock = $draftMarkdown[$params['block_id']];

		# delete the block
		unset($draftMarkdown[$params['block_id']]);
		$draftMarkdown = array_values($draftMarkdown);

		$store = $content->saveDraftMarkdown($item, $draftMarkdown);
		if($store !== true)
		{
			$response->getBody()->write(json_encode([
				'message' => Translations::translate('We could not store the content: ') . $store,
			]));

			return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
		}

		$draftMarkdownHtml	= $content->addDraftHtml($draftMarkdown);

		$onPageUpdated = [
			'oldMarkdown'		=> $content->markdownArrayToText($oldMarkdown),
			'newMarkdown'		=> $content->markdownArrayToText($draftMarkdown),
			'username'			=> $request->getAttribute('c_username'),
			'item'				=> $item,
		];
		$this->c->get('dispatcher')->dispatch(new OnPageUpdated($onPageUpdated), 'onPageUpdated');

		# if it was published before, then we need to refresh the navigation
		if($item->status == 'published')
		{
			$naviFileName 		= $navigation->getNaviFileNameForPath($item->path);
		    $navigation->clearNavigation([$naviFileName]);

			$draftNavigation 	= $navigation->getFullDraftNavigation($urlinfo, $this->settings['langattr']);
			$draftNavigation 	= $navigation->setActiveNaviItemsWithKeyPath($draftNavigation, $item->keyPathArray);
			$item 				= $navigation->getItemWithKeyPath($draftNavigation, $item->keyPathArray);

			$response->getBody()->write(json_encode([
				'content'		=> $draftMarkdownHtml,
				'navigation'	=> $draftNavigation,
				'item'			=> $item,
			]));
	
			return $response->withHeader('Content-Type', 'application/json');
		}

		$response->getBody()->write(json_encode([
			'content'		=> $draftMarkdownHtml,
			'navigation'	=> false,
			'item'			=> false,
		]));

		return $response->withHeader('Content-Type', 'application/json');
	}
}