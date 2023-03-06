/// <reference types="cypress" />

describe('Landing page test', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
        cy.intercept('POST', /\/graphql$/, { fixture: 'haiku.json' }).as('api');
    });

    it('homepage', () => {
        cy.get('[data-cy=switch-api-btn]').should('be.visible');
        cy.get('[data-cy=fetch-btn]').should('be.visible');
        cy.get('[data-cy=copy-btn]').should('be.visible');

        cy.wait('@api').then(() => {
            cy.get('[data-cy=fetch-btn').click();

            cy.wait('@api').then(() => {
                cy.get('[data-cy=copy-btn]').click();
                cy.get('[data-cy=copy-success-icon]').should('be.visible');
                cy.wait(2000);
                cy.get('[data-cy=copy-success-icon]').should('not.exist');
                cy.get('[data-cy=light-toggle-btn]').should('be.visible').click();
                cy.get('[data-cy=download-btn]').should('be.visible').click();
                cy.get('[data-cy=🤖-card]').should('not.exist');
            });
        });
    });

    it('ai-generation', () => {
        cy.get('[data-cy=switch-api-btn]').click();
        cy.get('[data-cy=fetch-btn]').should('be.visible');

        cy.wait('@api').then(() => {
            cy.get('[data-cy=🤖-card]').should('be.visible');
        });
    });
});