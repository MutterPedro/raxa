Feature: Create New Bill

    Scenario: Creating a valid bill anonymously
        Given I am in the home page
        And I click in the create bill button
        When I enter 100$ as the total amount
        And I enter Etvaldo as a participant
        Then I should see a bill row with total 50