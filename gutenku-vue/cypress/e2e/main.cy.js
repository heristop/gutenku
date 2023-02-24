/// <reference types="cypress" />

describe('Landing page test', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });

    it('works', () => {
        cy.intercept('POST', /\/graphsql$/, (req) => {
            req.reply({
                statusCode: 200, // default
                fixture: 'haiku.json'
            })
        }).as('api');

        cy.wait('@api').then(() => {
            cy.get('[data-cy=fetch-btn').should('be.visible').click();
        });
    });
});