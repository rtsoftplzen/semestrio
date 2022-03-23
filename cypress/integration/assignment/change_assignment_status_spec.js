describe('Change exam status', () => {
    beforeEach(() => {
        cy.clearDb();
    });

    it('correctly changes status', () => {
        cy.intercept('POST', '/api/change-state')
            .as('changeAssignmentState');

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
        cy.get('[data-cell="is-exam"]').first().click();
        cy.wait('@changeAssignmentState');

        // Then
        cy.get(`td[data-cell="is-exam"] i`)
            .first()
            .should('have.class', 'glyphicon-ok');
    });
});
