Feature: Sync Cues

    Scenario: Logged-out user is invited to log in for syncing
        Given I start from a fresh app with a bill named "Trilha do Lago"
        Then I should see a hint to log in for syncing
        When I follow the sync hint
        Then I should see the login screen
