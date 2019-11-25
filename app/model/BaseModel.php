<?php

namespace App\Model;

use Nette\Object;
use Nette\Database\Context;
use Nette\InvalidArgumentException;

/**
 * Class BaseModel
 * @package App\Model
 */
class BaseModel extends Object
{
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
     * @return \Nette\Database\Table\Selection
     */
    public function getTable(string $tableName = NULL)
    {
        if (!$tableName && !$this->tableName)
        {
            throw new InvalidArgumentException('Database model table name must be set');
        }

        return $this->databaseConnection->table($tableName ?: $this->tableName);
    }
}
