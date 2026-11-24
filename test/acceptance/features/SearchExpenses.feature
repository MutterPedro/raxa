Feature: Search Expenses

    Scenario: Narrowing and widening the expense feed by name
        Given I start from a fresh app with an empty bill named "Viagem a Campos"
        When I open the bill
        And I add an expense of 30$ named "Pizza no jantar"
        And I add another expense of 50$ named "Pizzaria do bairro"
        And I add another expense of 20$ named "Açaí no parque"
        Then I should see 3 expense rows
        When I search the expenses for "acai"
        Then I should see only the expense named "Açaí no parque"
        When I search the expenses for "pizza"
        Then I should see 2 expense rows
        When I clear the expense search
        Then I should see 3 expense rows
