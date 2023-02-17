/// <reference types="cypress" />

describe('Landing page test', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('works', () => {
        //cy.intercept('POST', '*/graphql', (req) => {
        //    req.reply({
        //        statusCode: 200, // default
        //        fixture: 'haiku.json'
        //    })
        //});

        //cy.wait('@api').then(() => {
        //cy.contains('h3', 'Haiku generated');
        //cy.get('[data-cy=fetch-btn').click();
        //cy.get('[data-cy=toggle-btn').click();
        //});
    });
});