<?php

namespace App\Component;

use Nette;
use ReflectionClass;

/**
 * Class BaseComponent
 * @package App\Component
 */
abstract class BaseComponent extends Nette\Application\UI\Control
{
    /** @var string název souboru se šablonou komponenty */
    protected $templateFile;


    /**
     * BaseComponent constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $componentFile = (new ReflectionClass($this))->getFileName();

        $this->templateFile = str_replace('.php', '.latte', $componentFile);
    }


    /**
     * Vykreslení komponenty
     */
    public function render()
    {
        $this->template->setFile($this->templateFile);
        $this->template->render();
    }
}
