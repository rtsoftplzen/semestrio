<?php declare(strict_types=1);

namespace App\Presenters;

use App\Model\AssignmentModel;
use Nette\Application\BadRequestException;
use Nette\Application\UI\Presenter;
use Nette\Database\Table\ActiveRow;
use Nette\Utils\Json;
use RuntimeException;

final class ApiPresenter extends Presenter
{
    /** @var AssignmentModel */
    private $assignmentModel;

    public function __construct(
        AssignmentModel $assignmentModel
    )
    {
        $this->assignmentModel = $assignmentModel;

        parent::__construct();
    }

    public function actionClearDb(): void
    {
        if ($this->getRequest()->getMethod() !== 'DELETE')
        {
            throw new RuntimeException();
        }

        $this->assignmentModel->removeAll();

        $this->terminate();
    }

    public function actionChangeState(): void
    {
        $rawBody = $this->getHttpRequest()->getRawBody();

        $data = Json::decode($rawBody);

        $assignment = $this->assignmentModel->find((int) $data->id);

        $newState = $assignment->is_exam ? 0 : 1;
        $this->assignmentModel->setIsExam($assignment->id, $newState);

        sleep(5);

        $this->sendJson(['newState' => $newState]);
    }


    public function actionAssignments(): void
    {
        $this->sendJson([
            'data' => array_map(
                function (ActiveRow $assignment) {
                    return [
                        'id' => $assignment->id,
                        'name' => $assignment->name,
                        'subject_id' => (int) $assignment->subject_id,
                        'is_exam' => (bool) $assignment->is_exam,
                        'date' => $assignment->date
                    ];
                },
                array_values($this->assignmentModel->getAssignments())
            )
        ]);
    }
}
