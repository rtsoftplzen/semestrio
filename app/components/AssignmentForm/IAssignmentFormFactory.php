<?php declare(strict_types=1);

namespace App\Components\AssignmentForm;

/**
 * Interface IAssignmentFormFactory
 * @package App\Components\AssignmentForm
 */
interface IAssignmentFormFactory
{
    /**
     * Vytvoření nové instance formuláře pomocí vygenerováné továrničky
     * @param int|null $assignmentId id semestrálky
     * @return AssignmentForm
     */
    public function create(int $assignmentId = NULL): AssignmentForm;
}
