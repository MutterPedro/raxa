Feature: Edit Bill And Expenses

    Scenario: Renaming a bill from its page
        Given I start from a fresh app with a bill named "Pizza Night"
        And I open that bill
        When I ask to edit the bill
        And I change the bill name to "Pizza Night Deluxe"
        And I save the bill edit
        Then I should see the bill heading "Pizza Night Deluxe"
        And I should see the bills list with the name "Pizza Night Deluxe"

    Scenario: Editing an expense amount from the bill page
        Given I start from a fresh app with a bill named "Rachidinho"
        And I open that bill
        And I add an expense of 40$ to the bill
        When I ask to edit the expense
        Then I should see the expense edit form
        When I change the expense amount to 100$
        And I save the expense edit
        Then I should see the bill total equal to 100$
        And I should see the expense row with amount 100$
