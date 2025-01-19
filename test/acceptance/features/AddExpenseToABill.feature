Feature: Add Expense to a Bill

    Scenario: Adding an expense to a bill
        Given I am in the home page
        And I have a bill with name "Birthday Party"
        And I click in the bill with name "Birthday Party"
        When I add an expense of 50$ to the bill
        And I add another expense of 100$ to the bill
        Then I should see the bill total equal to 150$