Feature: Delete Bill

    Scenario: Deleting a bill goes through a cancellable confirmation
        Given I start from a fresh app with a bill named "Trip to Beach"
        And I open that bill
        When I ask to delete the bill
        Then I should see a confirmation about deleting the bill
        When I cancel the deletion
        Then I should still be viewing the bill "Trip to Beach"
        When I ask to delete the bill
        And I confirm the deletion
        Then I should see the bills list with no bills
