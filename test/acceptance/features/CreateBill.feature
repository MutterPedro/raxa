Feature: Create New Bill

    Scenario: Creating a valid bill anonymously
        Given I am in the home page
        And I click in the create bill button
        When I enter "Birthday Party" as the name
        And I submit the form
        Then I should see a bill row with total 0$
        And I should see a bill row with name "Birthday Party"

    Scenario: Creating a bill with a first expense in one submit
        Given I am in the home page
        And I click in the create bill button
        When I enter "Ceburger" as the name
        And I enter 40$ as the first expense amount
        And I add "Ana" as the first expense participant
        And I submit the form
        Then I should see a bill row with total 40$
        And I should see a bill row with name "Ceburger"