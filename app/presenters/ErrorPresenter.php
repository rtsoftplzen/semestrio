<?php

namespace App\Presenters;

use Nette;
use Nette\Application\Responses;
use Tracy\ILogger;

/**
 * Class ErrorPresenter
 * @package App\Presenters
 */
class ErrorPresenter implements Nette\Application\IPresenter
{
	use Nette\SmartObject;

	/** @var ILogger */
	private $logger;


    /**
     * ErrorPresenter constructor.
     * @param ILogger $logger
     */
	public function __construct(ILogger $logger)
	{
		$this->logger = $logger;
	}


    /**
     * @param Nette\Application\Request $request
     * @return Nette\Application\IResponse|Responses\CallbackResponse|Responses\ForwardResponse
     */
	public function run(Nette\Application\Request $request)
	{
		$exception = $request->getParameter('exception');

		if ($exception instanceof Nette\Application\BadRequestException)
		{
			[$module, , $sep] = Nette\Application\Helpers::splitName($request->getPresenterName());

			return new Responses\ForwardResponse($request->setPresenterName($module . $sep . 'Error4xx'));
		}

		$this->logger->log($exception, ILogger::EXCEPTION);

		return new Responses\CallbackResponse(function ()
        {
			require __DIR__ . '/templates/Error/500.phtml';
		});
	}
}
