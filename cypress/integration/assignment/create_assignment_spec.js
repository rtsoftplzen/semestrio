describe('Creating new assignment', () => {
    beforeEach(() => {
        cy.clearDb();
    });

    context('when submitting a valid form', () => {
        it('successfully creates new assignment', () => {
            // Given
            cy.visit('/');

            const assignmentSuffix = Date.now();

            const testAssignmentName = `Testing assignment ${assignmentSuffix}`;
            const testSubject = {
                id: 2,
                title: 'Angličtina',
            };
            const testDate = '23.3.2022';

            cy.get('[data-message="total-count"]').invoke('text').then((text) => {
                const originalCount = parseInt(text.trim());

                cy.get('[data-test="assignment-name"]').type(testAssignmentName);

                cy.get('[data-test="subject"]').select(testSubject.id);

                cy.get('[data-test="is-exam"]').check();

                cy.get('[data-test="date"]').type(testDate);

                // When
                cy.get('[data-test="submit"]').click();

                // Then
                cy.get(`tr[data-row="${testAssignmentName}"] td[data-cell="assignment-name"]`)
                    .should('contain', testAssignmentName);

                cy.get(`tr[data-row="${testAssignmentName}"] td[data-cell="subject"]`)
                    .should('contain', testSubject.title);

                cy.get(`tr[data-row="${testAssignmentName}"] td[data-cell="is-exam"] i`)
                    .should('have.class', 'glyphicon-ok');

                cy.get(`tr[data-row="${testAssignmentName}"] td[data-cell="date"]`)
                    .should('contain', '23. 03. 2022');

                cy.get('.alert-success').should('be.visible');

                cy.get('[data-message="total-count"]').invoke('text').then((text) => {
                    const updatedCount = parseInt(text.trim());

                    expect(updatedCount).equal(originalCount + 1)
                });
            });
        })
    });

    context('when submitting an invalid form', () => {
        it('throws a corresponding error message', () => {
            // Given
            cy.visit('/');

            const testSubject = {
                id: 2,
                title: 'Angličtina',
            };
            const testDate = '23.3.2022';

            cy.get('[data-test="subject"]').select(testSubject.id);

            cy.get('[data-test="date"]').type(testDate);

            // When
            cy.get('[data-test="submit"]').click();

            // Then
            cy.get('div.form-group').should('have.class', 'has-error');

            cy.get('.help-block')
                .contains('Zadejte název semestrálky')
                .should('be.visible');

            cy.get('.alert-success').should('not.exist');
        });
    });
});
