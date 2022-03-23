describe('App layout', () => {
    it('contains correct elements', () => {
        // Given
        cy.visit('/');

        // Then
        cy.get('.navbar-brand').should('contain', 'Semestr.io');

        cy.get('h2').first().should('contain', 'Přidat semestrálku');

        cy.get('h2').eq(1).should('contain', 'Přehled semestrálek');
    });
});
