<h2>Přehled semestrálek</h2>

<?php if(!$assignments) { ?>
<div class="alert alert-info">V systému nejsou zadány žádné semestrálky...</div>
<?php } else { ?>

<table class="table table-assignments table-striped table-bordered">
    <tr>
        <th>ID</th>
        <th>Název semestrálky</th>
        <th>Předmět</th>
        <th>Zkouška</th>
        <th>Termín</th>
        <th></th>
    </tr>

    <?php foreach ($assignments as $assignment) {

        $rowClass = [];

        if($assignment->date < $actualDate && !$assignment->complete)
        {
            $rowClass[] = 'danger';
        }

        if($assignment->complete)
        {
            $rowClass[] = 'warning';
        }

    ?>
    <tr class="<?=implode(' ', $rowClass)?>">

        <td><?=$assignment->id?></td>
        <td><?=$assignment->name?></td>
        <td><?=$assignment->subject->name?></td>
        <td><i class="glyphicon <?=$assignment->is_exam ? 'glyphicon-ok' : 'glyphicon-remove'?>"></i></td>
        <td>{$assignment->date|date:'d. m. Y'}</td>
        <td class="action">

            <!-- Nastavení semestrálky jako dokončené / nedokončené -->
            <?php if (!$assignment->complete) { ?>
            <a href="<?=generateUrl('setCompleted', $assignment->id, 1)?>" class="btn btn-sm btn-success">
                <i class="glyphicon glyphicon-ok"></i> Dokončit</a>
            <?php } else { ?>
            <a href="<?=generateUrl('setCompleted', $assignment->id, 0)?>" class="btn btn-sm btn-warning">
                <i class="glyphicon glyphicon-repeat"></i> Znovu zpracovat</a>
            <?php } ?>

            <!-- Základní akce, které je možné provést se semestrálkou -->
            <a href="<?=generateUrl('edit', $assignment->id)?>" class="btn btn-sm btn-primary">
                <i class="glyphicon glyphicon-edit"></i> Upravit
            </a>

            <a href="<?=generateUrl('remove', $assignment->id)?>" class="btn btn-sm btn-danger"
               onclick="return confirm('Opravdu chcete práci smazat?')">
                <i class="glyphicon glyphicon-remove"></i> Smazat
            </a>
        </td>
    </tr>
    <?php } ?>
</table>

<?php } ?>