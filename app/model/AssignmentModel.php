<?php

namespace App\Model;

use Nette\Database\Table\ActiveRow;
use Nette\Utils\ArrayHash;
use Nette\Utils\DateTime;
use Exception;
use Tracy\Debugger;

/**
 * Class AssignmentModel
 * @package App\Model
 */
class AssignmentModel extends BaseModel
{
    /** @const požadovaný formát data */
    const DATE_FORMAT = 'd.m.Y';

    /** @var string název výchozí tabulky modelu */
    protected $tableName = 'assignment';


    /**
     * Nalezne semestrálku dle primárního klíče
     * @param $primaryKey
     * @param bool $forForm
     * @return bool|ActiveRow|ArrayHash
     */
    public function find($primaryKey, bool $forForm = FALSE)
    {
        $row = $this->getTable()->wherePrimary($primaryKey)->fetch();

        if ($row && $forForm)
        {
            /** @var ArrayHash $assignment */
            $assignment = ArrayHash::from($row);
            $assignment->date = $assignment->date->format($this::DATE_FORMAT);

            return $assignment;
        }

        return $row;
    }


    /**
     * Vrací kolekci semestrálek z úložiště (databáze)
     * @return array|\Nette\Database\Table\IRow[]
     */
    public function getAssignments()
    {
        return $this->getTable()->order('complete ASC, date ASC')->fetchAll();
    }


    /**
     * Vrací čísleník definovaných předmětů ve formátu id => název
     * @return array
     */
    public function getSubjects()
    {
        return $this
            ->getTable('subject')
            ->fetchPairs('id', 'name');
    }


    /**
     * Uloží informace o semestrálce do systému (databáze)
     * @param ArrayHash $assignment
     * @param int|null $assignmentId
     * @return bool|int|\Nette\Database\Table\IRow|ArrayHash
     */
    public function saveAssignment(ArrayHash $assignment, int $assignmentId = null)
    {
        try
        {
            $record = [
                'name'       => $assignment['name'],
                'subject_id' => $assignment['subject_id'],
                'is_exam'    => $assignment['is_exam'],
                'date'       => DateTime::createFromFormat($this::DATE_FORMAT, $assignment['date'])
            ];

            if($assignmentId === NULL)
            {
                return $this->getTable()->insert($record);
            }
            else
            {
                $this->getTable()->wherePrimary($assignmentId)->update($record);

                return $assignment;
            }
        }
        catch (Exception $exception)
        {
            Debugger::log($exception);

            return FALSE;
        }
    }


    /**
     * Odstranění semestrálky ze systému
     * @param int $assignmentId
     * @return bool
     */
    public function remove(int $assignmentId): bool
    {
        try
        {
            $this->getTable()->wherePrimary($assignmentId)->delete();

            return TRUE;
        }
        catch (Exception $exception)
        {
            Debugger::log($exception);

            return FALSE;
        }
    }


    /**
     * Nastavení stavu dokončení semestrálky
     * @param int $assignmentId
     * @param bool $complete
     * @return bool|int
     */
    public function setCompleted(int $assignmentId, bool $complete)
    {
        if ($assignmentId)
        {
            return $this->getTable()->wherePrimary($assignmentId)->update(['complete' => $complete]);
        }

        return FALSE;
    }
}
