Feature: Search Bills

    Scenario: Narrowing and widening the bill list by name
        Given I am in the home page
        And I have a bill with name "Show da Pizza"
        And I have another bill with name "Açaí no parque"
        And I have another bill with name "Cinema em família"
        Then the first bill row should be "Cinema em família"
        When I search for "acai"
        Then I should see only the bill named "Açaí no parque"
        When I clear the search
        Then I should see 3 bill rows
