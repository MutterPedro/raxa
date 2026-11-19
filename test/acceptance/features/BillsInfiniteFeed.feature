Feature: Bills Infinite Feed

    Scenario: Older bills load as the feed reaches the bottom
        Given I am in the home page
        And I have 12 bills
        And I reload the home page
        Then I should see 10 bill rows
        When I scroll to the bottom of the bills feed
        Then I should see 12 bill rows
