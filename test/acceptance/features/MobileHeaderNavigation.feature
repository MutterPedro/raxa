Feature: Mobile header navigation
  In order to sign in from my phone
  As a visitor
  I want the login link reachable in the header at phone width

  Scenario: Visitor opens the login screen from a phone
    Given I am in the home page in a phone viewport
    When I click the header login link
    Then I should see the login form
