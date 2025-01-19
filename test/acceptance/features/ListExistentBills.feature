Feature: List Existent Bills

    Scenario: Listing existent bills
        Given I am in the home page
        And I have a bill with name "Birthday Party"
        And I have another bill with name "Barbecue"
        Then I should see a bill row with name "Birthday Party"
        And I should see another bill row with name "Barbecue"