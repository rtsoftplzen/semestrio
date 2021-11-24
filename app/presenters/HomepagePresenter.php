<?php

namespace App\Presenters;

use App\Components\AssignmentForm\AssignmentForm;
use App\Components\AssignmentForm\IAssignmentFormFactory;
use Nette;
use App\Model\AssignmentModel;
use Nette\Application\AbortException;
use Nette\Application\BadRequestException;
use Nette\Utils\DateTime;

/**
 * Class HomepagePresenter
 * @package App\Presenters
 */
class HomepagePresenter extends Nette\Application\UI\Presenter
{
    /** @var IAssignmentFormFactory */
    private $assignmentFormFactory;

    /** @var AssignmentModel */
    private $assignmentModel;

    public const ACTION_DEFAULT = 'Homepage:default';


    /**
     * HomepagePresenter constructor.
     * @param IAssignmentFormFactory $assignmentFormFactory
     * @param AssignmentModel $assignmentModel
     */
    public function __construct(
        IAssignmentFormFactory $assignmentFormFactory,
        AssignmentModel $assignmentModel
    )
    {
        $this->assignmentFormFactory = $assignmentFormFactory;
        $this->assignmentModel = $assignmentModel;

        parent::__construct();
    }


    /**
     * Vykreslení výchozí stránky s přehledem semestrálek
     */
    public function renderDefault(): void
    {
        $this->template->actualDate  = (new DateTime())->setTime(0, 0);
        $this->template->assignments = $this->assignmentModel->getAssignments();
    }


    /**
     * Akce editace semestrálky
     * @param int $id
     * @throws BadRequestException
     */
    public function actionEdit(int $id): void
    {
        if (!$id)
        {
            throw new BadRequestException();
        }

        $assignment = $this->assignmentModel->find($id, true);
        if (!$assignment)
        {
            throw new BadRequestException();
        }
    }


    /**
     * Akce smazání semestrálky ze systému
     * @param int $id
     * @throws AbortException
     * @throws BadRequestException
     */
    public function actionRemove(int $id): void
    {
        if (!$id)
        {
            throw new BadRequestException();
        }

        $isRemoved = $this->assignmentModel->remove($id);

        if ($isRemoved)
        {
            $this->flashMessage('Položka byla úspěšně odstraněna', 'success');
        }
        else
        {
            $this->flashMessage('Položku se nezdařilo ze systému odstranit, prosím opakujte', 'danger');
        }

        $this->redirect('default');
    }


    /**
     * Akce nastavení stavu dokončení
     * @param int $id
     * @param int $complete
     * @throws AbortException
     * @throws BadRequestException
     */
    public function actionSetCompleted(int $id, int $complete): void
    {
        if (!$id || ($complete !== 0 && $complete !== 1))
        {
            throw new BadRequestException();
        }

        $isUpdated = $this->assignmentModel->setCompleted($id, $complete);

        if ($isUpdated)
        {
            $this->flashMessage(sprintf(
                'Semestrálka byla úspěšně označena jako %s.', $complete ? 'dokončená' : 'nedokončená'),
                'success'
            );
        }
        else
        {
            $this->flashMessage('U semestrálky se nezdařilo změnit stav dokončení, prosím opakujte.', 'danger');
        }

        $this->redirect('default');
    }


    /**
     * Vytvoření komponenty formuláře pro vložení nové semestrálky
     * @return AssignmentForm
     */
    protected function createComponentAssignmentForm(): AssignmentForm
    {
        $form = $this->assignmentFormFactory->create($this->getParameter('id'));

        $form->onFormSubmit[] = function ($assignment)
        {
            if ($assignment)
            {
                $this->flashMessage("Semestrálka '{$assignment->name}' byla úspěšně uložena.", 'success');

                $this->redirect('default');
            }
            else
            {
                $this->flashMessage('Semestrálku se nezdařilo uložit, prosím opakujte.', 'danger');
            }
        };

        return $form;
    }
}
