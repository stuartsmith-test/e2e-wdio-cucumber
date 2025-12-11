Feature: Add to Cart
  Scenario: Add an item to the cart and verify backend
    Given the cart is empty
    And I am on the home page
    When I add an item to the cart
    And I navigate to the cart
    Then I should see 1 item in the cart list
    And the database should show 1 item in the cart