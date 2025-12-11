Feature: Add to Cart Functionality

  Scenario: End-to-End Add to Cart and Checkout
    Given the API has reset the cart
    And I am on the home page
    When I add the item "Koala" to the cart
    And I navigate to the cart
    Then I should see 1 item in the cart list
    And the database should show 1 item in the cart