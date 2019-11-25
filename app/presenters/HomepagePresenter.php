<?php

namespace App\Presenters;

use Nette;
use App\Model\AssignmentModel;
use App\Components\IAssignmentFormFactory;

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


    /**
     * HomepagePresenter constructor.
     * @param IAssignmentFormFactory $assignmentFormFactory
     * @param AssignmentModel $assignmentModel
     */
    public function __construct(IAssignmentFormFactory $assignmentFormFactory, AssignmentModel $assignmentModel)
    {
        $this->assignmentFormFactory = $assignmentFormFactory;
        $this->assignmentModel = $assignmentModel;

        parent::__construct();
    }


    /**
     * Vykreslení výchozí stránky s přehledem semestrálek
     */
    public function renderDefault()
    {
        $this->template->actualDate  = (new Nette\Utils\DateTime())->setTime(0, 0, 0);
        $this->template->assignments = $this->assignmentModel->getAssignments();
    }


    /**
     * Akce editace semestrálky
     * @param int $id
     * @throws Nette\Application\BadRequestException
     */
    public function actionEdit($id)
    {
        if (!$id)
        {
            // $this->error
            throw new Nette\Application\BadRequestException();
        }
    }


    /**
     * Akce smazání semestrálky ze systému
     * @param int $id
     * @throws Nette\Application\AbortException
     * @throws Nette\Application\BadRequestException
     */
    public function actionRemove($id)
    {
        if (!$id)
        {
            // $this->error
            throw new Nette\Application\BadRequestException();
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
     * @throws Nette\Application\AbortException
     * @throws Nette\Application\BadRequestException
     */
    public function actionSetCompleted(int $id, int $complete)
    {
        if (!$id || ($complete != 0 && $complete != 1))
        {
            throw new Nette\Application\BadRequestException();
        }

        $isUpdated = $this->assignmentModel->setCompleted($id, $complete);

        if ($isUpdated !== FALSE)
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
     * @return \App\Components\AssignmentForm
     */
    protected function createComponentAssignmentForm()
    {
        $form = $this->assignmentFormFactory->create($this->getParameter('id'));

        $form->onFormSubmit[] = function($assignment)
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
