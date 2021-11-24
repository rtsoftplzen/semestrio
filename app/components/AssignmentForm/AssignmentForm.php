<?php

namespace App\Components\AssignmentForm;

use App\Component\BaseComponent;
use App\Model\AssignmentModel;
use App\Model\FormValidator;
use Nette\Database\IRow;
use Nette\Application\UI\Form;
use Tomaj\Form\Renderer\BootstrapRenderer;

/**
 * Class AssignmentForm
 * @package App\Components
 * @method onFormSubmit(IRow|int|bool $assignment)
 */
class AssignmentForm extends BaseComponent
{
    /** @const maximální délka názvu semestrálky */
    public const NAME_MAX_LENGTH = 50;

    /** @var int|null id semestrálky */
    private $assignmentId;

    /** @var AssignmentModel */
    private $assignmentModel;

    /** @var array */
    public $onFormSubmit;


    /**
     * AssignmentForm constructor.
     * @param int|null $assignmentId id semestrálky
     * @param AssignmentModel $assignmentModel
     */
    public function __construct(
        int $assignmentId = NULL,
        AssignmentModel $assignmentModel
    )
    {
        $this->assignmentId = $assignmentId;
        $this->assignmentModel = $assignmentModel;

        parent::__construct();
    }


    /**
     * Vytvoření komponenty formuláře
     * @return Form
     */
    protected function createComponentForm(): Form
    {
        $form = new Form();
        $form->setRenderer(new BootstrapRenderer());

        $form->addText('name', 'Název semestrálky')
             ->addRule(
                 Form::MAX_LENGTH,
                 'Název semestrálky je dlouhý, maximálně je povoleno ' . $this::NAME_MAX_LENGTH . ' znaků.',
                 $this::NAME_MAX_LENGTH
             )
             ->setRequired('Zadejte název semestrálky');

        $form->addSelect('subject_id', 'Předmět', $this->assignmentModel->getSubjects())
             ->setPrompt('Vyberte předmět')
             ->setRequired('Vyberte prosím předmět');

        $form->addCheckbox('is_exam', 'Jedná se o zkoušku?');

        $form->addText('date', 'Datum')
             ->setAttribute('placeholder', 'DD.MM.YYYY')
             ->setRequired('Zadejte datum odevzdání semestrálky')
             ->addRule(FormValidator::DATE, 'Zadejte platné datum');

        $form->addSubmit('save', 'Uložit');

        // split
        $form->onAnchor[] = [$this, 'handleForm'];

        return $form;
    }


    /**
     * Metoda volaná ihned po připojení formuláře k presenteru
     * @param Form $form
     */
    public function handleForm(Form $form): void
    {
        if ($form->isSuccess())
        {
            $assignment = $this->assignmentModel->saveAssignment($form->getValues(), $this->assignmentId);

            $this->onFormSubmit($assignment);
        }
        elseif ($this->assignmentId && !$form->isSubmitted())
        {
            $assignment = $this->assignmentModel->find($this->assignmentId, true);

            if ($assignment)
            {
                $form->setDefaults($assignment);
            }
        }
    }
}
