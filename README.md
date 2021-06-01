# No Limit Hold 'Em

## Technical Design

I'm using a 14-digit number system to represent the cards 2-Ace, with 1 representing a low-Ace.

Each significant digit in this number system represents a different hand:
1. 5th high card
2. 4th high card
3. 3rd high card
4. 2nd high card
5. 1st high card
6. Card value of a pair (e.g. a pair of Jacks is 11 in the 6th digit)
7. Card value of the low two pair
8. Card value of the high two pair
9. Card value of three of a kind
10. High card value of a straight
11. Low card value of a full house
12. High card value of a full house
13. High card value of a flush (the first 5 digits of high cards will determine winning flushes)
14. High card value of a straight flush

This gives each possible hand a numeric value that can be compared to any other hand easily. The hand with the largest numeric value is the winning hand.

## Distributed Design

I am currently thinking that each hand (of all players at a table) is represented by one single Cloudflare durable object. The pot of that hand will also be a durable object. Each players chip holdings should also be an object, etc. I don't need any relations here, so a traditional RDBMS is not necessary, document stores will do a fine job. And cloudflare durable objects will scale and requires zero configuration from me.