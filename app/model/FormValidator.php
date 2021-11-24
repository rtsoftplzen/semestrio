<?php

namespace App\Model;

use Nette\Forms\IControl;
use Nette\SmartObject;
use Nette\Utils\DateTime;

/**
 * Class FormValidator
 * @package App\Model
 */
class FormValidator
{
    use SmartObject;

    /** @const callback pro validaci datumu */
    public const DATE = __CLASS__ . '::date';


    /**
     * Ověří zda je v prvku formuláře přítomné platné datum ve formátu DD.MM.YYYY
     * @param IControl $control
     * @return bool
     */
    public static function date(IControl $control)
    {
        $value = $control->getValue();

        return $value === '' || DateTime::createFromFormat('d.m.Y', $value);
    }
}
