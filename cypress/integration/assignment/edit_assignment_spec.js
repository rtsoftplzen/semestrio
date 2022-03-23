describe('Editing an assignment', () => {
    beforeEach(() => {
        cy.clearDb();
    });

    context('when opening an edit form', () => {
        it('correctly populates defult values', () => {
            // Given
            const assignmentName = 'Test assignment XYZ';
            const subjectId = 3;
            const isExam = false;
            const date = '24.03.2022';

            cy.createAssignmentByApi(
                assignmentName,
                subjectId,
                isExam,
                date,
            );

            cy.visit('/');

            // When
            cy.get('[data-button="edit-button"]').first().click();

            // Then
            cy.get('[data-test="assignment-name"]')
                .should('have.value', assignmentName);

            cy.get('[data-test="subject"]')
                .should('have.value', subjectId)

            cy.get('[data-test="is-exam"]').should('not.be.checked');

            cy.get('[data-test="date"]').should('have.value', date);
        });
    });

    context('when submitting a valid form', () => {
        it.only('successfully edits the assignment', () => {
            // Given
            const assignmentName = 'Test assignment XYZ';
            const subjectId = 3;
            const isExam = false;
            const date = '24.03.2022';

            cy.createAssignmentByApi(
                assignmentName,
                subjectId,
                isExam,
                date,
            );

            cy.visit('/');

            cy.get('[data-button="edit-button"]').first().click();

            const assignmentSuffix = Date.now();

            const updateTestAssignmentName = `Testing assignment ${assignmentSuffix} XYZ`;
            const updatedTestSubject = {
                id: 4,
                title: 'Matematika',
            };
            const updateTestDate = '25.03.2022';

            cy.get('[data-test="assignment-name"]')
                .clear()
                .type(updateTestAssignmentName);

            cy.get('[data-test="subject"]')
                .select(updatedTestSubject.id);

            cy.get('[data-test="date"]')
                .clear()
                .type(updateTestDate);

            // When
            cy.get('[data-test="submit"]').click();

            // Then
            cy.get(`tr[data-row="${updateTestAssignmentName}"] td[data-cell="assignment-name"]`)
                .should('contain', updateTestAssignmentName);

            cy.get(`tr[data-row="${updateTestAssignmentName}"] td[data-cell="subject"]`)
                .should('contain', updatedTestSubject.title);

            cy.get(`tr[data-row="${updateTestAssignmentName}"] td[data-cell="is-exam"] i`)
                .should('have.class', 'glyphicon-remove');

            cy.get(`tr[data-row="${updateTestAssignmentName}"] td[data-cell="date"]`)
                .should('contain', '25. 03. 2022');

            cy.get('.alert-success').should('be.visible');

            cy.url().should('include', 'http://localhost:8090/?_fid')
        })
    });
});
