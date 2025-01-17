Feature: List Existent Bills

    Scenario: Listing existent bills
        Given I am in the home page
        And I have a bill with total 100$
        And I have another bill with total 200$
        Then I should see a bill row with total 100$
        And I should see another bill row with total 200$