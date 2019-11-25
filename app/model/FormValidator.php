<?php

namespace App\Model;

use Nette\Object;
use Nette\Forms\IControl;
use Nette\Utils\DateTime;

/**
 * Class FormValidator
 * @package App\Model
 */
class FormValidator extends Object
{
    /** @const callback pro validaci datumu */
    const DATE = __CLASS__ . '::date';


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
