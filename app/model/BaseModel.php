<?php

namespace App\Model;

use Nette\Database\Context;
use Nette\Database\Table\Selection;
use Nette\InvalidArgumentException;
use Nette\SmartObject;

/**
 * Class BaseModel
 * @package App\Model
 */
class BaseModel
{
    use SmartObject;

    /** @var Context připojení k databázy */
    private $databaseConnection;

    /** @var string název výchozí tabulky modelu */
    protected $tableName = '';

    /**
     * BaseModel constructor.
     * @param Context $databaseConnection
     */
    public function __construct(Context $databaseConnection)
    {
        $this->databaseConnection = $databaseConnection;
    }


    /**
     * Vrací database selection na tabulku modelu
     * @param string|null $tableName
     * @return Selection
     */
    public function getTable(string $tableName = NULL): Selection
    {
        if (!$tableName && !$this->tableName)
        {
            throw new InvalidArgumentException('Database model table name must be set');
        }

        return $this->databaseConnection->table($tableName ?: $this->tableName);
    }
}
