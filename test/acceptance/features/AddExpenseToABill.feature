Feature: Add Expense to a Bill

    Scenario: Adding an expense to a bill
        Given I am in the home page
        And I have a bill with name "Birthday Party"
        And I click in the bill with name "Birthday Party"
        When I add an expense of 50$ to the bill
        And I add another expense of 100$ to the bill
        Then I should see the bill total equal to 150$

    Scenario: Quick add expense by amount only
        Given I start from a fresh app with a bill named "Rachidinho" that has a first expense of 40$ split with "Ana"
        When I open the expense form
        And I hide the extra expense options
        And I add an expense of 60$ to the bill
        Then I should see the bill total equal to 100$
        And I should see division rows for both "Eu" and "Ana"