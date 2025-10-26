<?php

namespace Typemill\Models;

use Typemill\Static\Translations;

class SimpleMail
{
	private $from = false;

	private $reply = false;

	public $error;

	public function __construct($settings)
	{
		if(isset($settings['mailfrom']) && $settings['mailfrom'] != '')
		{
			$this->from = trim($settings['mailfrom']);

			if(isset($settings['mailfromname']) && $settings['mailfromname'] != '')
			{
				$this->from = '=?UTF-8?B?' . base64_encode($settings['mailfromname']) . '?= <' . trim($settings['mailfrom']) . '>';
			}
		}

		if(isset($settings['mailreply']) && $settings['mailreply'] != '')
		{
			$this->reply = trim($settings['mailreply']);
		}
	}

	public function send(string $to, string $subject, string $message)
	{
		if(!$this->from)
		{
			$this->error = Translations::translate('Email address in system settings is missing.');

			return false;
		}

		# 'Reply-To: webmaster@example.com' . "\r\n" .

		$headers 		= 'Content-Type: text/html; charset=utf-8' . "\r\n";
		$headers 		.= 'Content-Transfer-Encoding: base64' . "\r\n";
		$headers 		.= 'From: ' . $this->from . "\r\n";
		if($this->reply)
		{
			$headers 		.= 'Reply-To: base64' . $this->reply . "\r\n";
		}
		$headers 		.= 'X-Mailer: PHP/' . phpversion();

		$subject 		= '=?UTF-8?B?' . base64_encode($subject) . '?=';
		$message 		= base64_encode($message);
		
		$send = mail($to, $subject, $message, $headers);

		if ($send !== true)
		{
			$lastError = error_get_last();
			$this->error = $lastError ? $lastError['message'] : 'Unknown error occurred while sending mail.';
		}

		return $send;
	}
}