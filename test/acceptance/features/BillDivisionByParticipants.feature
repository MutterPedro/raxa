Feature: Bill Division By Participants

    Scenario: Dividing a bill by participants
        Given I am in the home page
        And I have a bill with name "Birthday Party"
        And I click in the bill with name "Birthday Party"
        When I add an expense of 300$ with me,John,Robert as participants and me as the payer to the bill
        And I add another expense of 100$ with me,John as participants and John as the payer to the bill
        Then I should get 100$ for Robert
        And I should get 50$ for John
        And I should get -150$ for me